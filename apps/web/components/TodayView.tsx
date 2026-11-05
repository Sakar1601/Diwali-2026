"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { applySettings, ensureDevice, track } from "@/lib/device";
import { Icon } from "./ui";

export type Item = { id: string; starts_at: string; ends_at: string | null; title: string; place: string; zone: string };
const fmt = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Phoenix" });
const range = (a: string, b: string | null) => (b ? `${fmt(a).replace(/ [AP]M$/, "")} – ${fmt(b)}` : fmt(a));
const ok = (u?: string | null) => !!u && /^https:\/\//.test(u);

export default function TodayView({ items, photo, whatsapp, instagram }: { items: Item[]; photo?: string | null; whatsapp?: string | null; instagram?: string | null }) {
  const [now, setNow] = useState(() => Date.now());
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => {
    applySettings(); ensureDevice();
    try { setDone(JSON.parse(localStorage.getItem("lbl.followed") || "{}")); } catch { /* ignore */ }
    const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t);
  }, []);
  const end = (i: Item) => (i.ends_at ? +new Date(i.ends_at) : +new Date(i.starts_at) + 30 * 60000);
  const st = (i: Item) => (now >= end(i) ? "done" : now >= +new Date(i.starts_at) ? "now" : "up");
  const current = items.find((i) => st(i) === "now"); const next = items.find((i) => st(i) === "up");
  const pct = current ? Math.min(100, Math.max(0, ((now - +new Date(current.starts_at)) / (end(current) - +new Date(current.starts_at))) * 100)) : 0;
  const left = current ? Math.max(0, Math.round((end(current) - now) / 60000)) : 0;
  const follow = (k: string, ev: string) => { track(ev); const n = { ...done, [k]: true }; setDone(n); try { localStorage.setItem("lbl.followed", JSON.stringify(n)); } catch { /* ignore */ } };
  const More = ({ href, ic, bg, t, s, ext, ev }: { href: string; ic: "diya" | "cam" | "star"; bg: string; t: string; s: string; ext?: boolean; ev?: string }) => (
    <Link className="li" href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer", onClick: () => ev && track(ev) } : {})}>
      <span className="ic" style={{ background: bg }}><Icon n={ic} /></span><div className="grow"><b>{t}</b><small>{s}</small></div><span className="chev">{ext ? "↗" : "›"}</span>
    </Link>
  );
  return (
    <>
      <div>
        <div className="ser" style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.15 }}>शुभ दीपावली</div>
        <div className="mu" style={{ marginTop: 4 }}>Saturday, Nov 14 · Welcome to the mandir</div>
      </div>
      {current && (
        <div className="now inv">
          <div className="tag"><span className="live" />HAPPENING NOW</div>
          <div><div className="ser" style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.1 }}>{current.title}</div><div className="mu" style={{ marginTop: 2 }}>{range(current.starts_at, current.ends_at)} · {current.place}</div></div>
          <div>
            <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,.22)" }}><div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#F8C13F,#F4B31A)" }} /></div>
            <div className="sm mu" style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}><span>Started {fmt(current.starts_at).replace(/ [AP]M$/, "")}</span><span>{left} min left</span></div>
          </div>
          <div style={{ display: "flex", gap: 8 }}><Link className="btn btn-p" href="/map" style={{ flex: 1, minHeight: 48 }}>Directions</Link><Link className="btn btn-s" href="/updates" style={{ flex: 1, minHeight: 48 }}>Updates</Link></div>
        </div>
      )}
      {next && (
        <div className="grp"><div className="li"><span className="ic" style={{ background: "#0E8C7F" }}><Icon n="star" /></span><div className="grow"><div className="eb">Up next</div><b>{next.title}</b></div><b style={{ fontSize: 18 }}>{fmt(next.starts_at)}</b></div></div>
      )}
      <div className="sec">
        <h2 className="ser" style={{ fontSize: 24, fontWeight: 600 }}>My Day</h2>
        <div>
          {items.length === 0 && <p>The schedule will appear here.</p>}
          {items.map((i) => (
            <div className={`srow ${st(i) === "done" ? "done" : ""}`} key={i.id}>
              <div className="tm">{fmt(i.starts_at)}</div>
              <div className="grow tt"><div style={{ fontWeight: 600, lineHeight: 1.3 }}>{i.title}</div><div className="tag" style={{ marginTop: 3 }}><span className={`dot ${i.zone}`} />{i.place}</div></div>
              {st(i) === "done" && <span style={{ color: "var(--ok)", fontSize: 20, fontWeight: 800, width: 44, textAlign: "center" }} aria-label="Finished">✓</span>}
              {st(i) === "now" && <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".06em", color: "#fff", background: "var(--sf)", borderRadius: 8, padding: "5px 9px" }}>LIVE</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="sec"><div className="eb">More to do</div>
        <div className="grp">
          <More href="/booths" ic="diya" bg="#E3A72F" t="Virtual booths" s="Six small activities. Light a lamp at each." />
          <More href="/moments" ic="cam" bg="#C2557F" t="Photo frames" s="Take a selfie with a Diwali frame." />
          <More href="/annakut" ic="diya" bg="#E3A72F" t="What is Annakut?" s="A 2-minute guide to today." />
          {ok(photo) && <More href={photo!} ic="star" bg="#4353A2" t="Find my booth photos" s="Opens the photo app. Scan your face to see them." ext ev="opened_photo_link" />}
        </div>
      </div>
      {(ok(whatsapp) || ok(instagram)) && (
        <div className="sec"><div className="eb">Stay connected</div>
          <div className="grp">
            {ok(whatsapp) && <div className="li"><div className="grow"><b>WhatsApp channel</b><small>{done.w ? "Done. Thank you!" : "Opens WhatsApp"}</small></div>
              {done.w ? <span className="tag" style={{ color: "#15803D" }}><span className="dot" style={{ background: "#15803D" }} />Done</span>
                : <a className="btn btn-p" style={{ minHeight: 44, width: "auto", padding: "0 20px", fontSize: 15 }} href={whatsapp!} target="_blank" rel="noopener noreferrer" onClick={() => follow("w", "followed_whatsapp")}>Follow</a>}</div>}
            {ok(instagram) && <div className="li"><div className="grow"><b>Instagram page</b><small>{done.i ? "Done. Thank you!" : "Opens Instagram"}</small></div>
              {done.i ? <span className="tag" style={{ color: "#15803D" }}><span className="dot" style={{ background: "#15803D" }} />Done</span>
                : <a className="btn btn-p" style={{ minHeight: 44, width: "auto", padding: "0 20px", fontSize: 15 }} href={instagram!} target="_blank" rel="noopener noreferrer" onClick={() => follow("i", "followed_instagram")}>Follow</a>}</div>}
          </div>
          <div className="sm mu">Tap Follow, then come back. We mark it done.</div>
        </div>
      )}
    </>
  );
}
