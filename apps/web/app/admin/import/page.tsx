"use client";
import { useState } from "react";
import { api } from "@/lib/staff-client";

type S = { rows: number; families: number; errors: string[]; warnings: string[]; errorCount: number; warningCount: number; imported?: number };
export default function Import() {
  const [csv, setCsv] = useState(""); const [name, setName] = useState(""); const [s, setS] = useState<S | null>(null);
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const text = await f.text(); setCsv(text); setName(f.name); setS(null); setMsg(""); go(text, f.name, false);
  }
  async function go(text: string, nm: string, commit: boolean) {
    setBusy(true); setMsg("");
    const r = await api("/api/admin/import", { method: "POST", body: JSON.stringify({ csv: text, name: nm, commit }) });
    setBusy(false);
    if (r.status === 401) { setMsg("Sign in as an admin first (/staff)."); return; }
    if (!r.ok) { setMsg("The import failed. Nothing was half-saved that you need to worry about; run it again."); return; }
    setS(r.body.preview ?? r.body);
  }
  return (
    <main className="screen pg">
      <span className="step">Admin</span><h1>Import people</h1>
      <p>Choose the CSV. You will see a summary before anything is saved.</p>
      <input type="file" accept=".csv,text/csv" onChange={pick} aria-label="CSV file" />
      {s && (
        <section className="card">
          <b>{s.rows} rows · {s.families} families</b>
          <p>{s.errorCount} rows skipped · {s.warningCount} to check</p>
          {[...s.errors, ...s.warnings].map((x, i) => <p key={i} style={{ fontSize: ".85rem" }}>• {x}</p>)}
          {s.imported == null
            ? <button className="btn" disabled={busy || s.rows === 0} onClick={() => go(csv, name, true)}>Import {s.rows - s.errorCount} people</button>
            : <p style={{ color: "var(--ok)" }}>Imported {s.imported} people.</p>}
        </section>
      )}
      {msg && <p role="alert" style={{ color: "var(--er)" }}>{msg}</p>}
    </main>
  );
}
