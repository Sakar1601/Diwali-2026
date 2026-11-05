"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/staff-client";

type R = { id: string; name: string; phone: string; email: string; pending: boolean };
export default function StaffSearch() {
  const [q, setQ] = useState(""); const [rows, setRows] = useState<R[]>([]); const [msg, setMsg] = useState("");
  useEffect(() => {
    if (q.trim().length < 2) { setRows([]); setMsg(""); return; }
    const t = setTimeout(async () => {
      const r = await api(`/api/staff/search?q=${encodeURIComponent(q)}`);
      if (r.status === 401) return location.replace("/staff");
      if (r.status === 503) return setMsg("Search is paused by the admin.");
      setRows(r.body?.results ?? []); setMsg(r.body?.results?.length ? "" : "No match. Try fewer letters or the last 4 phone digits.");
    }, 250);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <main className="screen pg">
      <h1>Find a person</h1>
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, last 4 of phone, or email" aria-label="Search"
        style={{ minHeight: 56, padding: "12px 14px", borderRadius: 12, border: "1.5px solid rgba(67,83,162,.3)", font: "inherit" }} />
      {rows.map((r) => (
        <Link key={r.id} href={`/staff/person/${r.id}`} className="card" style={{ color: "inherit", textDecoration: "none" }}>
          <b>{r.name}</b>{r.pending && <span className="step" style={{ marginLeft: 8 }}>Walk-up</span>}
          <p>{[r.phone, r.email].filter(Boolean).join(" · ")}</p>
        </Link>
      ))}
      {msg && <p>{msg}</p>}
      <Link className="btn ghost" href="/staff/new">Add a new person</Link>
    </main>
  );
}
