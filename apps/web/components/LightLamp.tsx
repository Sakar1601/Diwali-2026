"use client";
import { useEffect, useState } from "react";
import { deviceHeaders, ensureDevice } from "@/lib/device";

export default function LightLamp({ slug }: { slug: string }) {
  const [lit, setLit] = useState(false); const [err, setErr] = useState("");
  useEffect(() => { ensureDevice().then(() => fetch("/api/lamp", { headers: deviceHeaders() }).then((r) => r.json()).then((d) => setLit((d.mine ?? []).includes(slug))).catch(() => {})); }, [slug]);
  async function light() {
    setErr("");
    const r = await fetch("/api/lamp", { method: "POST", headers: deviceHeaders(), body: JSON.stringify({ booth: slug }) }).catch(() => null);
    if (r?.ok) setLit(true); else setErr("Could not light the lamp. Check your connection and try again.");
  }
  return (<>
    {lit ? <a className="btn btn-s" href="/booths" style={{ color: "#17795C", borderColor: "#17795C" }}>Your lamp is lit · Back to booths</a> : <button className="btn btn-p" onClick={light}>Light my lamp</button>}
    {err && <p role="alert" className="sm" style={{ color: "var(--er)" }}>{err}</p>}
  </>);
}
