"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { applySettings, deviceHeaders, ensureDevice, tfetch } from "@/lib/device";
import { BOOTHS } from "@/lib/booths";
import { Icon } from "./ui";

export default function BoothsView() {
  const [mine, setMine] = useState<string[]>([]); const [total, setTotal] = useState(0);
  useEffect(() => {
    applySettings();
    let local: string[] = []; try { local = JSON.parse(localStorage.getItem("lbl.lit") || "[]"); } catch { /* ignore */ }
    setMine(local);
    ensureDevice().then(() => tfetch("/api/lamp", { headers: deviceHeaders() }).then((r) => r.json()).then((d) => { setMine([...new Set([...local, ...(d.mine ?? [])])]); setTotal(d.total ?? 0); })).catch(() => {});
  }, []);
  return (
    <>
      <div><div className="eb">Six lamps</div><h1 className="ttl" style={{ marginTop: 6 }}>Virtual booths</h1><p className="lead">Do one small thing at each booth to light its lamp.</p></div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }} aria-label={`${mine.length} of ${BOOTHS.length} lamps lit`}>
        {BOOTHS.map((b) => <span key={b.slug} className={`lamp ${mine.includes(b.slug) ? "on" : "off"}`}><Icon n="diya" /></span>)}
      </div>
      <div className="zz">
        {BOOTHS.map((b, i) => (
          <Link key={b.slug} href={`/booths/${b.slug}`} className="card">
            <span className="num" style={{ width: 44, height: 44, background: b.color, fontSize: 18 }}>{i + 1}</span>
            <div className="grow"><b>{b.name}</b><small className="mu" style={{ display: "block", fontSize: 14 }}>{b.sub}</small></div>
            {mine.includes(b.slug) ? <span className="lamp on" style={{ width: 34, height: 34 }}><Icon n="diya" /></span> : <span className="chev">›</span>}
          </Link>
        ))}
      </div>
      <p className="sm ctr">Wall of Lights: {total.toLocaleString()} lamps lit by visitors so far.</p>
    </>
  );
}
