"use client";
import { useEffect, useState } from "react";
import { applySettings, enablePush, ensureDevice, getSettings, markOnboarded, saveSettings } from "@/lib/device";

function Toggle({ label, hint, on, onChange }: { label: string; hint: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="row card" style={{ cursor: "pointer" }}>
      <span><b>{label}</b><br /><span style={{ color: "var(--mu)", fontSize: ".9rem" }}>{hint}</span></span>
      <input type="checkbox" role="switch" checked={on} onChange={(e) => onChange(e.target.checked)} style={{ width: 28, height: 28, accentColor: "#4353A2" }} />
    </label>
  );
}

export default function Setup() {
  const [reminders, setReminders] = useState(false);
  const [wayfinding, setWayfinding] = useState(false);
  useEffect(() => { applySettings(); const s = getSettings(); setReminders(s.reminders); setWayfinding(s.wayfinding); }, []);

  async function finish(save: boolean) {
    if (save) {
      saveSettings({ reminders, wayfinding });
    }
    markOnboarded();
    await ensureDevice();
    if (save && reminders) await enablePush();
    window.location.assign("/today");
  }
  return (
    <main className="screen">
      <span className="step">Step 2 of 2</span>
      <h1>Set up in one step</h1>
      <p>All optional. The app works if you skip.</p>
      <Toggle label="Show reminders" hint="A show is about to start, food is served, photos are ready." on={reminders} onChange={setReminders} />
      <Toggle label="Help me find my way" hint="Your location stays on your phone." on={wayfinding} onChange={setWayfinding} />
      <p style={{ fontSize: ".9rem" }}>You can change these any time in Profile.</p>
      <button className="btn" onClick={() => finish(true)}>Continue</button>
      <button className="btn ghost" onClick={() => finish(false)}>Skip all</button>
    </main>
  );
}
