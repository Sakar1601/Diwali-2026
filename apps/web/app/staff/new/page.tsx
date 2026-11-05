"use client";
import { useState } from "react";
import { api } from "@/lib/staff-client";

export default function NewPerson() {
  const [f, setF] = useState({ first: "", last: "", phone: "", email: "", street: "", city: "Phoenix", zip: "", consent: false });
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const ok = f.first && f.last && f.street && f.zip;
  async function save() {
    setBusy(true); setErr("");
    const r = await api("/api/staff/walkup", { method: "POST", body: JSON.stringify(f) });
    setBusy(false);
    if (r.status === 401) return location.replace("/staff");
    if (!r.ok) return setErr("Could not save. Try again.");
    location.assign(`/staff/person/${r.body.id}`);
  }
  const inp = { minHeight: 52, padding: "12px 14px", borderRadius: 12, border: "1px solid var(--line)", font: "inherit", width: "100%" } as const;
  return (
    <main className="screen pg">
      <h1>Add a new person</h1>
      <input style={inp} placeholder="First name" value={f.first} onChange={set("first")} aria-label="First name" />
      <input style={inp} placeholder="Last name" value={f.last} onChange={set("last")} aria-label="Last name" />
      <input style={inp} placeholder="Mobile (optional)" inputMode="tel" value={f.phone} onChange={set("phone")} aria-label="Phone" />
      <input style={inp} placeholder="Email (optional)" inputMode="email" value={f.email} onChange={set("email")} aria-label="Email" />
      <input style={inp} placeholder="Street address" value={f.street} onChange={set("street")} aria-label="Street address" />
      <input style={inp} placeholder="City" value={f.city} onChange={set("city")} aria-label="City" />
      <input style={inp} placeholder="ZIP" inputMode="numeric" value={f.zip} onChange={set("zip")} aria-label="ZIP" />
      <label className="row"><span>OK to be told about future events</span><input type="checkbox" checked={f.consent} onChange={set("consent")} style={{ width: 28, height: 28 }} /></label>
      <button className="btn" disabled={!ok || busy} onClick={save}>Save person</button>
      {err && <p role="alert" style={{ color: "var(--er)" }}>{err}</p>}
    </main>
  );
}
