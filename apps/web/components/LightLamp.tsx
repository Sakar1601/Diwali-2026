"use client";
import { useEffect, useState } from "react";
import { deviceHeaders, ensureDevice, tfetch, writeOrQueue } from "@/lib/device";

export default function LightLamp({ slug }: { slug: string }) {
  const [lit, setLit] = useState(false); const [queued, setQueued] = useState(false);
  useEffect(() => {
    try { if ((JSON.parse(localStorage.getItem("lbl.lit") || "[]") as string[]).includes(slug)) setLit(true); } catch { /* ignore */ }
    ensureDevice().then(() => tfetch("/api/lamp", { headers: deviceHeaders() }).then((r) => r.json()).then((d) => { if ((d.mine ?? []).includes(slug)) setLit(true); })).catch(() => {});
  }, [slug]);
  async function light() {
    setLit(true);
    try { const l = new Set<string>(JSON.parse(localStorage.getItem("lbl.lit") || "[]")); l.add(slug); localStorage.setItem("lbl.lit", JSON.stringify([...l])); } catch { /* ignore */ }
    const r = await writeOrQueue("/api/lamp", { booth: slug });
    if (r === "queued") setQueued(true);
  }
  return (<>
    {lit ? <a className="btn btn-s" href="/booths" style={{ color: "#17795C", borderColor: "#17795C" }}>Your lamp is lit · Back to booths</a> : <button className="btn btn-p" onClick={light}>Light my lamp</button>}
    {queued && <p role="status" className="sm mu">Saved on your phone. It will count as soon as you are back online.</p>}
  </>);
}
