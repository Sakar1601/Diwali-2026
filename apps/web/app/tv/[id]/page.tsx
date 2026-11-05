"use client";
import { use, useEffect, useState } from "react";

type Item = { template: string; payload: { title?: string; body?: string }; seconds: number };
type D = { takeover: { title?: string; body?: string } | null; items: Item[]; schedule: { starts_at: string; title: string; place: string }[]; lamps: number };
const tm = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Phoenix" });

export default function TV({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const [d, setD] = useState<D | null>(null); const [i, setI] = useState(0); const [bad, setBad] = useState(false);
  useEffect(() => {
    const t = new URLSearchParams(location.search).get("t") ?? "";
    const pull = async () => { try { const r = await fetch(`/api/tv/${id}?t=${encodeURIComponent(t)}`, { cache: "no-store" }); if (r.status === 401) return setBad(true); setD(await r.json()); setBad(false); } catch { /* keep last good data on screen */ } };
    pull(); const x = setInterval(pull, 20000); return () => clearInterval(x);
  }, [id]);
  const items = d?.items ?? [];
  useEffect(() => { if (!items.length) return; const cur = items[i % items.length]; const x = setTimeout(() => setI((n) => n + 1), (cur?.seconds ?? 15) * 1000); return () => clearTimeout(x); }, [i, items.length]); // eslint-disable-line
  const Big = ({ title, body }: { title?: string; body?: string }) => (<><h1 style={{ fontSize: "6vw", color: "#fff", margin: 0 }}>{title}</h1><p style={{ fontSize: "3vw", color: "#DAD6F0", margin: 0 }}>{body}</p></>);
  let view: React.ReactNode = <Big title="Light Beyond Lamps" body="BAPS Swaminarayan Mandir · Phoenix" />;
  if (bad) view = <Big title="Screen not linked" body="Ask the network team for a new screen link." />;
  else if (d?.takeover) view = <Big title={d.takeover.title} body={d.takeover.body} />;
  else if (items.length) {
    const it = items[i % items.length];
    if (it.template === "schedule") view = (<><h1 style={{ fontSize: "5vw", color: "#fff", margin: 0 }}>Today</h1>{d!.schedule.map((s, k) => <p key={k} style={{ fontSize: "3vw", color: "#fff", margin: 0 }}>{tm(s.starts_at)} · {s.title} <span style={{ color: "#F4B31A" }}>{s.place}</span></p>)}</>);
    else if (it.template === "wall") view = <Big title={`${d!.lamps.toLocaleString()} lamps lit`} body="Light yours at the virtual booths" />;
    else view = <Big title={it.payload.title} body={it.payload.body} />;
  }
  return (<main style={{ minHeight: "100dvh", background: "#4353A2", display: "flex", flexDirection: "column", justifyContent: "center", gap: "2vw", padding: "6vw", cursor: "none" }}>{view}</main>);
}
