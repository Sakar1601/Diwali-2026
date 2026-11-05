"use client";
import { useEffect, useState } from "react";
import { api, sb } from "@/lib/staff-client";
import { Logo } from "@/components/ui";

type Stage = "email" | "code" | "enroll" | "challenge";
export default function StaffLogin() {
  const [email, setEmail] = useState(""); const [code, setCode] = useState(""); const [stage, setStage] = useState<Stage>("email");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [qr, setQr] = useState(""); const [secret, setSecret] = useState(""); const [factor, setFactor] = useState(""); const [totp, setTotp] = useState("");
  const [canSkip, setCanSkip] = useState(false);
  const go = () => location.assign("/staff/search");

  // After sign-in: admins add a second step (authenticator app). Everyone else goes straight in.
  async function afterSignIn() {
    const me = await api("/api/staff/me");
    if (me.status === 401) { await sb.auth.signOut(); setErr("This email is not set up for the network team."); setStage("email"); return; }
    if (me.body.role !== "admin" || me.body.aal === "aal2") return go();
    const f = await sb.auth.mfa.listFactors();
    const verified = f.data?.totp?.[0];
    if (verified) { setFactor(verified.id); setStage("challenge"); return; }
    for (const x of f.data?.all ?? []) if (x.status === "unverified") await sb.auth.mfa.unenroll({ factorId: x.id });
    const en = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: "Diwali admin" });
    if (en.error || !en.data) { setErr("Two-step sign-in could not start."); setCanSkip(!me.body.mfaRequired); setStage("enroll"); return; }
    setFactor(en.data.id); setQr(en.data.totp.qr_code); setSecret(en.data.totp.secret); setStage("enroll");
  }
  useEffect(() => { (async () => { const { data } = await sb.auth.getSession(); if (data.session) { setBusy(true); await afterSignIn(); setBusy(false); } })(); /* eslint-disable-next-line */ }, []);

  async function send() {
    setBusy(true); setErr("");
    const r = await fetch("/api/staff/otp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    setBusy(false); if (r.status === 429) setErr("Too many tries. Wait a few minutes."); else setStage("code");
  }
  async function verify() {
    setBusy(true); setErr("");
    const { error } = await sb.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: "email" });
    if (error) { setBusy(false); setErr("That code did not work."); return; }
    await afterSignIn(); setBusy(false);
  }
  async function mfa() {
    setBusy(true); setErr("");
    const ch = await sb.auth.mfa.challenge({ factorId: factor });
    if (ch.error || !ch.data) { setBusy(false); setErr("Could not check the code. Try again."); return; }
    const v = await sb.auth.mfa.verify({ factorId: factor, challengeId: ch.data.id, code: totp.trim() });
    setBusy(false); if (v.error) { setErr("That code did not work."); return; }
    go();
  }
  return (
    <main className="screen narrow">
      <div className="pg fl" style={{ justifyContent: "center", minHeight: "100dvh" }}>
        <div className="ctr" style={{ display: "grid", justifyItems: "center", gap: 10 }}><Logo size={56} /><div className="eb">Network team</div></div>
        <div className="ctr"><h1 className="ttl">{stage === "enroll" ? "Set up two-step sign-in" : stage === "challenge" ? "Enter your app code" : "Sign in"}</h1>
          <p className="lead">{stage === "email" ? "We email you a 6-digit code. No password." : stage === "code" ? `Code sent to ${email.trim()}` : stage === "enroll" ? "Admins use an authenticator app as a second step." : "Open your authenticator app and type the 6-digit code."}</p></div>
        <div className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
          {stage === "email" && (<>
            <input className="inp" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" style={{ width: "100%" }} />
            <button className="btn btn-p" disabled={busy || !email.includes("@")} onClick={send}>Send code</button>
          </>)}
          {stage === "code" && (<>
            <input className="inp" inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Email code" style={{ width: "100%", textAlign: "center", letterSpacing: ".3em", fontSize: 22 }} />
            <button className="btn btn-p" disabled={busy || code.trim().length < 6} onClick={verify}>Sign in</button>
            <button className="btn btn-s" onClick={() => { setStage("email"); setCode(""); setErr(""); }}>Use a different email</button>
          </>)}
          {stage === "enroll" && (<>
            {qr && <div className="ctr"><img src={qr} alt="QR code for your authenticator app" width={176} height={176} style={{ background: "#fff", borderRadius: 12 }} /></div>}
            {secret && <p className="sm mu ctr" style={{ wordBreak: "break-all" }}>Cannot scan? Type this key: <b>{secret}</b></p>}
            {qr && (<>
              <input className="inp" inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit app code" value={totp} onChange={(e) => setTotp(e.target.value)} aria-label="App code" style={{ width: "100%", textAlign: "center", letterSpacing: ".3em", fontSize: 22 }} />
              <button className="btn btn-p" disabled={busy || totp.trim().length < 6} onClick={mfa}>Confirm and continue</button>
            </>)}
            {canSkip && <button className="btn btn-s" onClick={go}>Continue without it</button>}
          </>)}
          {stage === "challenge" && (<>
            <input className="inp" inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit app code" value={totp} onChange={(e) => setTotp(e.target.value)} aria-label="App code" style={{ width: "100%", textAlign: "center", letterSpacing: ".3em", fontSize: 22 }} />
            <button className="btn btn-p" disabled={busy || totp.trim().length < 6} onClick={mfa}>Continue</button>
          </>)}
          {err && <p role="alert" style={{ color: "var(--er)", fontWeight: 600 }}>{err}</p>}
        </div>
      </div>
    </main>
  );
}
