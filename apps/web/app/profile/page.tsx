"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { applySettings, enablePush, getSettings, removeMyData, saveSettings, type Settings } from "@/lib/device";
import { Dock, PageBar, Toggle } from "@/components/ui";

export default function Profile() {
  const [s, setS] = useState<Settings | null>(null); const [msg, setMsg] = useState("");
  useEffect(() => { applySettings(); setS(getSettings()); }, []);
  if (!s) return null;
  async function set(k: keyof Settings, v: boolean) {
    setS(saveSettings({ [k]: v })); setMsg("");
    if (k === "reminders" && v && !(await enablePush())) setMsg("Reminders need notifications to be allowed in your phone settings.");
  }
  const T = ({ k, t, d }: { k: keyof Settings; t: string; d: string }) => (
    <div className="li"><div className="grow"><b>{t}</b><small>{d}</small></div><Toggle on={s[k]} onChange={(v) => set(k, v)} label={t} /></div>
  );
  async function wipe() { if (confirm("Remove your settings and lamps from this phone and our records?")) { await removeMyData(); location.assign("/"); } }
  return (
    <main className="screen">
      <div className="pg">
        <PageBar back="/today" tag="Profile" />
        <div className="grp">
          <T k="large" t="Larger text" d="Easier to read." /><T k="contrast" t="Higher contrast" d="Stronger colors." />
          <T k="reminders" t="Show reminders" d="Alerts for shows and food." /><T k="wayfinding" t="Help me find my way" d="Your location stays on your phone." />
        </div>
        {msg && <p role="alert" className="sm">{msg}</p>}
        <div className="grp">
          <Link className="li" href="/help"><div className="grow"><b>Help and volunteers</b><small>A volunteer can do everything for you.</small></div><span className="chev">›</span></Link>
          <button className="li" onClick={wipe} style={{ width: "100%", background: "none", border: 0, font: "inherit", textAlign: "left", cursor: "pointer" }}><div className="grow"><b>Remove my data from this phone</b><small>Clears your settings.</small></div><span className="chev">›</span></button>
        </div>
        <div className="sm mu ctr">This phone holds only your settings.</div>
      </div>
      <Dock active="/today" />
    </main>
  );
}
