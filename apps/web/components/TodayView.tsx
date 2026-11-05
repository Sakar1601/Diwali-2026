"use client";
import { useEffect, useState } from "react";
import { applySettings, ensureDevice } from "@/lib/device";

export type Item = { id: string; starts_at: string; ends_at: string | null; title: string; place: string };
const fmt = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Phoenix" });

export default function TodayView({ items }: { items: Item[] }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { applySettings(); ensureDevice(); const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);
  const st = (i: Item) => {
    const s = +new Date(i.starts_at), e = i.ends_at ? +new Date(i.ends_at) : s + 30 * 60000;
    return now >= e ? "done" : now >= s ? "now" : "up";
  };
  const current = items.find((i) => st(i) === "now");
  const next = items.find((i) => st(i) === "up");
  return (
    <>
      {current && (
        <section className="card" style={{ borderColor: "var(--am)" }}>
          <span className="step">Happening now</span>
          <h2>{current.title}</h2>
          <p>{fmt(current.starts_at)} · {current.place}</p>
        </section>
      )}
      {next && <p>Up next: <b style={{ color: "var(--tx)" }}>{next.title}</b> at {fmt(next.starts_at)}</p>}
      <section className="card" aria-label="Schedule">
        <h2>Schedule</h2>
        {items.length === 0 && <p>The schedule will appear here.</p>}
        {items.map((i) => (
          <div className="row" key={i.id} style={{ opacity: st(i) === "done" ? 0.55 : 1 }}>
            <div><b>{i.title}</b><p>{fmt(i.starts_at)} · {i.place}</p></div>
            {st(i) === "now" && <span className="step" style={{ color: "var(--ok)" }}>Live</span>}
          </div>
        ))}
      </section>
    </>
  );
}
