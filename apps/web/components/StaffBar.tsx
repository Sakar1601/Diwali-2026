"use client";
import { useEffect, useState } from "react";
import { api, flushTicks, readTicks, sb } from "@/lib/staff-client";
import { Logo } from "@/components/ui";

export default function StaffBar({ title, back }: { title: string; back?: string }) {
  const [me, setMe] = useState<{ role: string; station: string | null } | null>(null);
  const [pend, setPend] = useState(0); const [offline, setOffline] = useState(false);
  useEffect(() => {
    const upd = () => setPend(readTicks().length);
    const run = async () => { upd(); if (readTicks().length) { await flushTicks(); upd(); } };
    upd(); void run();
    const t = setInterval(run, 8000);
    const on = () => { setOffline(false); void run(); }, off = () => setOffline(true);
    window.addEventListener("online", on); window.addEventListener("offline", off); window.addEventListener("lbl-outbox", upd);
    setOffline(!navigator.onLine);
    return () => { clearInterval(t); window.removeEventListener("online", on); window.removeEventListener("offline", off); window.removeEventListener("lbl-outbox", upd); };
  }, []);
  useEffect(() => { api("/api/staff/me").then((r) => { if (r.status === 401) location.replace("/staff"); else if (r.ok) setMe(r.body); }); }, []);
  return (
    <div className="sbar">
      {back ? <a className="back" href={back} aria-label="Back">‹</a> : <Logo size={40} />}
      <div className="grow"><div className="eb">Network team{me ? ` · ${me.role}` : ""}{me?.station ? ` · ${me.station}` : ""}</div><b>{title}</b></div>
      {(pend > 0 || offline) && <span className={`chip ${offline ? "warn" : "ok"}`} role="status">{offline ? "No connection" : ""}{offline && pend > 0 ? " · " : ""}{pend > 0 ? `${pend} waiting to send` : ""}</span>}
      <button className="sout" onClick={async () => { await sb.auth.signOut(); location.replace("/staff"); }}>Sign out</button>
    </div>
  );
}
