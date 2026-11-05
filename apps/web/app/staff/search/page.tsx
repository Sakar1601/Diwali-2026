"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/staff-client";
import StaffBar from "@/components/StaffBar";

type R = { id: string; name: string; phone: string; email: string; pending: boolean };
const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
export default function StaffSearch() {
  const [q, setQ] = useState(""); const [rows, setRows] = useState<R[]>([]); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (q.trim().length < 2) { setRows([]); setMsg(""); return; }
    const t = setTimeout(async () => {
      setBusy(true); const r = await api(`/api/staff/search?q=${encodeURIComponent(q)}`); setBusy(false);
      if (r.status === 401) return location.replace("/staff");
      if (r.status === 0) return setMsg("No connection. Keep typing once the signal is back.");
      if (r.status === 503) return setMsg("Search is paused by the admin.");
      if (r.status === 429) return setMsg("Slow down for a moment, then try again.");
      setRows(r.body?.results ?? []); setMsg(r.body?.results?.length ? "" : "No match. Try fewer letters or the last 4 phone digits.");
    }, 250);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <main className="screen narrow"><div className="pg fl">
      <StaffBar title="Find a person" />
      <input className="inp big" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, last 4 of phone, or email" aria-label="Search" />
      <div aria-live="polite">
        {rows.length > 0 && <div className="grp">{rows.map((r) => (
          <Link key={r.id} href={`/staff/person/${r.id}`} className="li">
            <span className="av">{initials(r.name)}</span>
            <div className="grow"><b>{r.name}</b><small>{[r.phone, r.email].filter(Boolean).join(" · ") || "No contact on file"}</small></div>
            {r.pending && <span className="chip warn">Walk-up</span>}<span className="chev">›</span>
          </Link>))}</div>}
        {busy && rows.length === 0 && <p className="mu">Searching…</p>}
        {msg && <p className="mu">{msg}</p>}
        {!q && <p className="mu">Start typing to find a family. Phone and email are partly hidden unless you are an admin.</p>}
      </div>
      <Link className="btn btn-s" href="/staff/new">Add a new person</Link>
    </div></main>
  );
}
