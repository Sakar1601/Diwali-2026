"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { applySettings, enablePush, getSettings, removeMyData, saveSettings, type Settings } from "@/lib/device";
import TabBar from "@/components/TabBar";

export default function Profile() {
  const [s, setS] = useState<Settings | null>(null); const [msg, setMsg] = useState("");
  useEffect(() => { applySettings(); setS(getSettings()); }, []);
  if (!s) return null;
  async function set(k: keyof Settings, v: boolean) {
    setS(saveSettings({ [k]: v })); setMsg("");
    if (k === "reminders" && v && !(await enablePush())) setMsg("Reminders need notifications to be allowed in your phone settings.");
  }
  const T = ({ k, label }: { k: keyof Settings; label: string }) => (
    <label className="row card" style={{ cursor: "pointer" }}><b>{label}</b>
      <input type="checkbox" role="switch" checked={s[k]} onChange={(e) => set(k, e.target.checked)} style={{ width: 28, height: 28, accentColor: "#4353A2" }} /></label>
  );
  async function wipe() { if (confirm("Remove your settings and lamps from this phone and our records?")) { await removeMyData(); location.assign("/"); } }
  return (
    <main className="screen">
      <h1>Profile</h1>
      <T k="large" label="Larger text" /><T k="contrast" label="Higher contrast" /><T k="reminders" label="Show reminders" /><T k="wayfinding" label="Help me find my way" />
      {msg && <p role="alert">{msg}</p>}
      <Link className="btn ghost" href="/help">Help and volunteers</Link>
      <button className="btn ghost" onClick={wipe}>Remove my data from this phone</button>
      <p style={{ fontSize: ".9rem" }}>This phone holds only your settings.</p>
      <TabBar active="/profile" />
    </main>
  );
}
