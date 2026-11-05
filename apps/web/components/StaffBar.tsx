"use client";
import { useEffect, useState } from "react";
import { api, sb } from "@/lib/staff-client";
import { Logo } from "@/components/ui";

export default function StaffBar({ title, back }: { title: string; back?: string }) {
  const [me, setMe] = useState<{ role: string; station: string | null } | null>(null);
  useEffect(() => { api("/api/staff/me").then((r) => { if (r.status === 401) location.replace("/staff"); else setMe(r.body); }); }, []);
  return (
    <div className="sbar">
      {back ? <a className="back" href={back} aria-label="Back">‹</a> : <Logo size={40} />}
      <div className="grow"><div className="eb">Network team{me ? ` · ${me.role}` : ""}{me?.station ? ` · ${me.station}` : ""}</div><b>{title}</b></div>
      <button className="sout" onClick={async () => { await sb.auth.signOut(); location.replace("/staff"); }}>Sign out</button>
    </div>
  );
}
