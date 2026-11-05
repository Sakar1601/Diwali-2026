"use client";
import { useState } from "react";
import { api } from "@/lib/staff-client";
import StaffBar from "@/components/StaffBar";

export default function NewPerson() {
  const [f, setF] = useState({ first: "", last: "", phone: "", email: "", street: "", city: "Phoenix", zip: "", consent: false });
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const ok = f.first.trim() && f.last.trim() && f.street.trim() && /^\d{5}$/.test(f.zip.trim());
  async function save() {
    setBusy(true); setErr("");
    const r = await api("/api/staff/walkup", { method: "POST", body: JSON.stringify(f) });
    setBusy(false);
    if (r.status === 401) return location.replace("/staff");
    if (!r.ok) return setErr("Could not save. Try again.");
    location.assign(`/staff/person/${r.body.id}`);
  }
  const F = ({ k, l, ...p }: { k: keyof typeof f; l: string } & React.InputHTMLAttributes<HTMLInputElement>) => <div className="fld"><label htmlFor={k}>{l}</label><input id={k} className="inp" value={String(f[k])} onChange={set(k)} {...p} /></div>;
  return (
    <main className="screen narrow"><div className="pg fl">
      <StaffBar title="Add a new person" back="/staff/search" />
      <div className="cols2" style={{ gap: 14 }}><F k="first" l="First name" autoComplete="off" /><F k="last" l="Last name" autoComplete="off" /></div>
      <div className="cols2" style={{ gap: 14 }}><F k="phone" l="Mobile (optional)" inputMode="tel" /><F k="email" l="Email (optional)" inputMode="email" /></div>
      <F k="street" l="Street address" />
      <div className="cols2" style={{ gap: 14 }}><F k="city" l="City" /><F k="zip" l="ZIP" inputMode="numeric" maxLength={5} /></div>
      <label className="card row"><span>OK to be told about future events</span><input type="checkbox" checked={f.consent} onChange={set("consent")} style={{ width: 28, height: 28 }} /></label>
      <button className="btn btn-p" disabled={!ok || busy} onClick={save}>Save person</button>
      {err && <p role="alert" style={{ color: "var(--er)", fontWeight: 600 }}>{err}</p>}
    </div></main>
  );
}
