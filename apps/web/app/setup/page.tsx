"use client";
import { useEffect, useState } from "react";
import { applySettings, enablePush, ensureDevice, getSettings, markOnboarded, saveSettings } from "@/lib/device";
import { PageBar, Toggle } from "@/components/ui";

export default function Setup() {
  const [reminders, setReminders] = useState(false);
  const [wayfinding, setWayfinding] = useState(false);
  useEffect(() => { applySettings(); const s = getSettings(); setReminders(s.reminders); setWayfinding(s.wayfinding); }, []);
  async function finish(save: boolean) {
    if (save) saveSettings({ reminders, wayfinding });
    markOnboarded();
    await ensureDevice();
    if (save && reminders) await enablePush();
    window.location.assign("/today");
  }
  return (
    <main className="screen narrow">
      <div className="pg fl">
        <PageBar back="/install" tag="Step 2 of 2" />
        <div><h1 className="ttl">Set up in one step</h1><p className="lead">All optional. The app works if you skip.</p></div>
        <div className="grp">
          <div className="li"><div className="grow"><b>Show reminders</b><small>A show is about to start, food is served, photos are ready.</small></div><Toggle on={reminders} onChange={setReminders} label="Show reminders" /></div>
          <div className="li"><div className="grow"><b>Help me find my way</b><small>Your location stays on your phone.</small></div><Toggle on={wayfinding} onChange={setWayfinding} label="Help me find my way" /></div>
        </div>
        <div className="sm mu">You can change these any time in Profile.</div>
      </div>
      <div className="cta"><button className="btn btn-p" onClick={() => finish(true)}>Continue</button><button className="btn btn-g" onClick={() => finish(false)}>Skip all</button></div>
    </main>
  );
}
