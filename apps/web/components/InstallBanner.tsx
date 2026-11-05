"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// Shown once on phones that have not installed the app. Dismissal is remembered on this phone only.
export default function InstallBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      const standalone = matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone;
      const phone = matchMedia("(max-width: 900px) and (pointer: coarse)").matches;
      if (!standalone && phone && localStorage.getItem("lbl.installDismissed") !== "1") setShow(true);
    } catch { /* ignore */ }
  }, []);
  if (!show) return null;
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderColor: "rgba(244,179,26,.5)", background: "rgba(244,179,26,.08)" }}>
      <div className="grow"><b>Keep this on your phone</b><div className="sm mu">Add it to your home screen to get show reminders.</div></div>
      <Link className="btn btn-p mini" href="/install">Show me</Link>
      <button aria-label="Dismiss" onClick={() => { try { localStorage.setItem("lbl.installDismissed", "1"); } catch { /* ignore */ } setShow(false); }} style={{ border: 0, background: "none", fontSize: 22, color: "var(--mu)", minWidth: 36, minHeight: 44 }}>×</button>
    </div>
  );
}
