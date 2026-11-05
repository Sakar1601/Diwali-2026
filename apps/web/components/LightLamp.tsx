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
  return lit ? <p style={{ color: "var(--ok)", fontWeight: 600 }}>Your lamp is lit. Thank you.</p> : (<><button className="btn" onClick={light}>Light this lamp</button>{err && <p role="alert" style={{ color: "var(--er)" }}>{err}</p>}</>);
}
