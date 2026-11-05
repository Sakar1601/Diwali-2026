"use client";
import { useEffect, useState } from "react";
import { api, sb } from "@/lib/staff-client";

export default function StaffLogin() {
  const [email, setEmail] = useState(""); const [code, setCode] = useState(""); const [sent, setSent] = useState(false);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { (async () => { const { data } = await sb.auth.getSession(); if (data.session && (await api("/api/staff/search?q=zz")).status !== 401) location.replace("/staff/search"); })(); }, []);
  async function send() {
    setBusy(true); setErr("");
    const { error } = await sb.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: true } });
    setBusy(false); if (error) setErr("Could not send the code. Try again in a minute."); else setSent(true);
  }
  async function verify() {
    setBusy(true); setErr("");
    const { error } = await sb.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: "email" });
    if (error) { setBusy(false); setErr("That code did not work."); return; }
    const r = await api("/api/staff/search?q=zz"); setBusy(false);
    if (r.status === 401) { await sb.auth.signOut(); setErr("This email is not set up for the network team."); return; }
    location.assign("/staff/search");
  }
  const input = { width: "100%", minHeight: 52, padding: "12px 14px", borderRadius: 12, border: "1px solid var(--line)", font: "inherit" } as const;
  return (
    <main className="screen pg">
      <span className="step">Network team</span><h1>Sign in</h1>
      <p>We email you a 6-digit code. No password.</p>
      {!sent ? (<>
        <input style={input} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
        <button className="btn" disabled={busy || !email.includes("@")} onClick={send}>Send code</button>
      </>) : (<>
        <input style={input} inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Code" />
        <button className="btn" disabled={busy || code.trim().length < 6} onClick={verify}>Sign in</button>
      </>)}
      {err && <p role="alert" style={{ color: "var(--er)" }}>{err}</p>}
    </main>
  );
}
