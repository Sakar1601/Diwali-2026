"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { applySettings, deviceHeaders, ensureDevice } from "@/lib/device";
import { BOOTHS } from "@/lib/booths";

export default function BoothsView() {
  const [mine, setMine] = useState<string[]>([]); const [total, setTotal] = useState(0);
  useEffect(() => { applySettings(); ensureDevice().then(() => fetch("/api/lamp", { headers: deviceHeaders() }).then((r) => r.json()).then((d) => { setMine(d.mine ?? []); setTotal(d.total ?? 0); }).catch(() => {})); }, []);
  return (
    <>
      <section className="card" style={{ borderColor: "var(--am)" }}>
        <span className="step">Your Light Card</span>
        <h2>{mine.length} of {BOOTHS.length} lamps lit</h2>
        <div style={{ display: "flex", gap: 8, margin: "8px 0" }} aria-hidden>
          {BOOTHS.map((b) => <span key={b.slug} style={{ width: 28, height: 28, borderRadius: 14, background: mine.includes(b.slug) ? "var(--am)" : "var(--s2)" }} />)}
        </div>
        <p>Wall of Lights: {total.toLocaleString()} lamps lit by visitors so far.</p>
      </section>
      {BOOTHS.map((b) => (
        <Link key={b.slug} href={`/booths/${b.slug}`} className="card row" style={{ color: "inherit", textDecoration: "none" }}>
          <span><b>{b.name}</b><p>{b.sub}{mine.includes(b.slug) ? " · lamp lit" : ""}</p></span>›
        </Link>
      ))}
    </>
  );
}
