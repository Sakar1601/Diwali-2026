"use client";
import { useState } from "react";
import { api } from "@/lib/staff-client";
import StaffBar from "@/components/StaffBar";

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
    <main className="screen narrow"><div className="pg fl">
      <StaffBar title="Import people" back="/admin" />
      <p className="lead">Choose the CSV. You will see a summary before anything is saved.</p>
      <label className="drop"><b>{name || "Choose a CSV file"}</b><span className="sm mu">{name ? "Choose a different file" : "Columns are matched by name. Nothing is saved yet."}</span>
        <input type="file" accept=".csv,text/csv" onChange={pick} aria-label="CSV file" hidden /></label>
      {busy && <p className="mu">Checking the file…</p>}
      {s && (
        <section className="card" style={{ display: "grid", gap: 12, padding: 20 }}>
          <div className="stats"><div className="stat"><span>Rows</span><b>{s.rows}</b></div><div className="stat" style={{ "--c": "#0E8C7F" } as React.CSSProperties}><span>Families</span><b>{s.families}</b></div>
            <div className="stat" style={{ "--c": "#C0392B" } as React.CSSProperties}><span>Skipped</span><b>{s.errorCount}</b></div><div className="stat" style={{ "--c": "#E3A72F" } as React.CSSProperties}><span>To check</span><b>{s.warningCount}</b></div></div>
          {[...s.errors, ...s.warnings].length > 0 && <div className="sm mu" style={{ display: "grid", gap: 4, maxHeight: 220, overflow: "auto" }}>{[...s.errors, ...s.warnings].map((x, i) => <span key={i}>• {x}</span>)}</div>}
          {s.imported == null
            ? <button className="btn btn-p" disabled={busy || s.rows === 0} onClick={() => go(csv, name, true)}>Import {s.rows - s.errorCount} people</button>
            : <p style={{ color: "var(--ok)", fontWeight: 700 }}>Imported {s.imported} people.</p>}
        </section>
      )}
      {msg && <p role="alert" style={{ color: "var(--er)", fontWeight: 600 }}>{msg}</p>}
    </div></main>
  );
}
