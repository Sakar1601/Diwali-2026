"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/staff-client";

const TABS = ["Dashboard", "Notify", "Screens", "Staff", "Settings", "Audit"] as const;
type Tab = (typeof TABS)[number];
const inp = { minHeight: 48, padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)", font: "inherit", width: "100%", background: "#fff" } as const;
const tm = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Phoenix" });

function useGet<T>(path: string, dep: unknown = 0) {
  const [d, setD] = useState<T | null>(null);
  const load = useCallback(async () => { const r = await api(path); if (r.status === 401) { location.replace("/staff"); return; } setD(r.body); }, [path]);
  useEffect(() => { load(); }, [load, dep]);
  return [d, load] as const;
}

function Dashboard() {
  const [s] = useGet<any>("/api/admin/stats");
  if (!s) return <p>Loading…</p>;
  const T = ({ k, v }: { k: string; v: number }) => <div className="card"><p>{k}</p><h1>{v.toLocaleString()}</h1></div>;
  return (<>
    <p>Counts for {s.day}. No names are shown here.</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12 }}>
      <T k="Calendars given" v={s.calendar} /><T k="Extra Calendars" v={s.calendarExtra} /><T k="Prasad given" v={s.prasad} /><T k="People on file" v={s.people} />
      <T k="Walk-ups added" v={s.walkups} /><T k="Phones opened app" v={s.devices} /><T k="Reminders on" v={s.pushSubs} /><T k="Lamps lit" v={s.lamps} />
      <T k="Followed WhatsApp" v={s.events.followed_whatsapp} /><T k="Followed Instagram" v={s.events.followed_instagram} /><T k="Opened photo link" v={s.events.opened_photo_link} /><T k="Moments made" v={s.events.made_moment} />
    </div></>);
}

function Notify() {
  const [n, setN] = useState(0); const [list] = useGet<{ items: any[] }>("/api/admin/notify", n);
  const [f, setF] = useState({ title: "", body: "", url: "", sendAt: "", push: false }); const [msg, setMsg] = useState("");
  async function send() {
    const r = await api("/api/admin/notify", { method: "POST", body: JSON.stringify({ ...f, sendAt: f.sendAt ? new Date(f.sendAt).toISOString() : undefined, feed: true }) });
    setMsg(r.ok ? (f.push ? "Scheduled. Push goes out within a minute of the time." : "Posted to Updates.") : "Could not save. Check the fields."); if (r.ok) { setF({ title: "", body: "", url: "", sendAt: "", push: false }); setN(n + 1); }
  }
  return (<>
    <section className="card" style={{ display: "grid", gap: 10 }}>
      <input style={inp} placeholder="Title (80 max)" value={f.title} maxLength={80} onChange={(e) => setF({ ...f, title: e.target.value })} aria-label="Title" />
      <textarea style={{ ...inp, minHeight: 90 }} placeholder="Message (200 max). Keep it generic; it shows on lock screens." value={f.body} maxLength={200} onChange={(e) => setF({ ...f, body: e.target.value })} aria-label="Message" />
      <input style={inp} placeholder="Link when tapped (optional, /page or https://…)" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} aria-label="Link" />
      <label>Send at (blank = now)<input style={inp} type="datetime-local" value={f.sendAt} onChange={(e) => setF({ ...f, sendAt: e.target.value })} /></label>
      <label className="row"><span>Also send as a phone notification</span><input type="checkbox" checked={f.push} onChange={(e) => setF({ ...f, push: e.target.checked })} style={{ width: 28, height: 28 }} /></label>
      <button className="btn" disabled={!f.title || !f.body} onClick={send}>Schedule</button>{msg && <p>{msg}</p>}
    </section>
    {(list?.items ?? []).map((i) => (<div className="card row" key={i.id}><span><b>{i.title}</b><p>{i.sent_at ? `Sent ${tm(i.sent_at)}` : `Scheduled ${tm(i.send_at)}`} · {i.destinations.includes("push") ? "push + feed" : "feed"}</p></span>
      {!i.sent_at && <button className="btn ghost" style={{ width: "auto" }} onClick={async () => { await api("/api/admin/notify", { method: "POST", body: JSON.stringify({ id: i.id, cancel: true }) }); setN(n + 1); }}>Cancel</button>}</div>))}
  </>);
}

function Screens() {
  const [n, setN] = useState(0); const [d] = useGet<any>("/api/admin/screens", n); const [name, setName] = useState(""); const [link, setLink] = useState("");
  const [tk, setTk] = useState({ title: "", body: "", minutes: 10, screen_id: "all" }); const [it, setIt] = useState({ screen_id: "", template: "message", title: "", body: "" });
  const post = async (b: object) => { const r = await api("/api/admin/screens", { method: "POST", body: JSON.stringify(b) }); setN(n + 1); return r; };
  return (<>
    <section className="card" style={{ display: "grid", gap: 10 }}><b>Add a screen</b>
      <input style={inp} placeholder="Name, e.g. Entrance TV" value={name} onChange={(e) => setName(e.target.value)} aria-label="Screen name" />
      <button className="btn" disabled={!name} onClick={async () => { const r = await post({ action: "create_screen", name }); if (r.ok) { setLink(location.origin + r.body.url); setName(""); } }}>Create screen</button>
      {link && <><p>Open this link on the TV now. It is shown only once.</p><input style={inp} readOnly value={link} onFocus={(e) => e.currentTarget.select()} aria-label="Screen link" /></>}
    </section>
    <section className="card" style={{ display: "grid", gap: 10 }}><b>Take over screens</b>
      <input style={inp} placeholder="Headline" value={tk.title} onChange={(e) => setTk({ ...tk, title: e.target.value })} aria-label="Headline" />
      <input style={inp} placeholder="Message" value={tk.body} onChange={(e) => setTk({ ...tk, body: e.target.value })} aria-label="Message" />
      <select style={inp} value={tk.screen_id} onChange={(e) => setTk({ ...tk, screen_id: e.target.value })}><option value="all">All screens</option>{(d?.screens ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <div className="row"><button className="btn" disabled={!tk.title} onClick={() => post({ action: "takeover", ...tk })}>Show for {tk.minutes} min</button>
        <button className="btn ghost" onClick={() => post({ action: "end_takeovers" })}>End all</button></div></section>
    {(d?.screens ?? []).map((s: any) => (<section className="card" key={s.id}><b>{s.name}</b><p>{s.last_seen_at ? `Last seen ${tm(s.last_seen_at)}` : "Never connected"}</p>
      {(d.items as any[]).filter((x) => x.screen_id === s.id).map((x) => (<div className="row" key={x.id}><span>{x.template}: {x.payload?.title}</span><button className="btn ghost" style={{ width: "auto" }} onClick={() => post({ action: "remove_item", id: x.id })}>Remove</button></div>))}
      <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
        <select style={inp} value={it.screen_id === s.id ? it.template : "message"} onChange={(e) => setIt({ ...it, screen_id: s.id, template: e.target.value })}><option value="message">Message</option><option value="schedule">Schedule</option><option value="wall">Wall of Lights</option><option value="welcome">Welcome</option></select>
        <input style={inp} placeholder="Title" value={it.screen_id === s.id ? it.title : ""} onChange={(e) => setIt({ ...it, screen_id: s.id, title: e.target.value })} aria-label="Title" />
        <input style={inp} placeholder="Text" value={it.screen_id === s.id ? it.body : ""} onChange={(e) => setIt({ ...it, screen_id: s.id, body: e.target.value })} aria-label="Text" />
        <button className="btn" onClick={() => { post({ action: "add_item", ...it, screen_id: s.id }); setIt({ screen_id: "", template: "message", title: "", body: "" }); }}>Add to playlist</button></div></section>))}
  </>);
}

function Staff() {
  const [n, setN] = useState(0); const [d] = useGet<any>("/api/admin/staff", n); const [f, setF] = useState({ email: "", role: "volunteer", station: "" });
  return (<>
    <section className="card" style={{ display: "grid", gap: 10 }}><b>Invite someone</b>
      <input style={inp} type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-label="Email" />
      <select style={inp} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option value="volunteer">Volunteer</option><option value="coordinator">Coordinator</option><option value="admin">Admin</option></select>
      <input style={inp} placeholder="Station (e.g. Calendar desk)" value={f.station} onChange={(e) => setF({ ...f, station: e.target.value })} aria-label="Station" />
      <button className="btn" disabled={!f.email} onClick={async () => { await api("/api/admin/staff", { method: "POST", body: JSON.stringify(f) }); setF({ email: "", role: "volunteer", station: "" }); setN(n + 1); }}>Invite</button>
      <p>They sign in at /staff with this email. The first sign-in activates the invite.</p></section>
    {(d?.invites ?? []).map((i: any) => <div className="card row" key={i.email}><span><b>{i.email}</b><p>{i.role} · invited</p></span><button className="btn ghost" style={{ width: "auto" }} onClick={async () => { await api("/api/admin/staff", { method: "POST", body: JSON.stringify({ removeInvite: i.email }) }); setN(n + 1); }}>Remove</button></div>)}
    {(d?.staff ?? []).map((s: any) => <div className="card row" key={s.id}><span><b>{s.email}</b><p>{s.role}{s.station ? ` · ${s.station}` : ""}{s.active ? "" : " · turned off"}</p></span><button className="btn ghost" style={{ width: "auto" }} onClick={async () => { await api("/api/admin/staff", { method: "POST", body: JSON.stringify({ id: s.id, active: !s.active }) }); setN(n + 1); }}>{s.active ? "Turn off" : "Turn on"}</button></div>)}
  </>);
}

function Settings() {
  const [n, setN] = useState(0); const [d] = useGet<{ settings: Record<string, any> }>("/api/admin/settings", n); const [vals, setVals] = useState<Record<string, string>>({}); const [msg, setMsg] = useState("");
  if (!d) return <p>Loading…</p>; const S = d.settings;
  const flag = async (key: string, value: boolean) => { await api("/api/admin/settings", { method: "POST", body: JSON.stringify({ key, value }) }); setN(n + 1); };
  const FL: [string, string, string][] = [["kill_visitor_writes", "Pause visitor saves", "Phones can still read everything. Lamps and sign-ups stop saving."], ["kill_staff_search", "Pause staff search and ticks", "Use if a volunteer device is lost."], ["kill_push_sending", "Pause phone notifications", "Scheduled notifications wait."], ["kill_share_everyone", "Pause sharing to everyone", "Reserved for photo sharing."]];
  const TX: [string, string][] = [["photo_app_url", "Photo app link (https://…)"], ["whatsapp_url", "WhatsApp channel link"], ["instagram_url", "Instagram link"], ["helpdesk_phone", "Help desk phone"]];
  return (<>
    {FL.map(([k, t, h]) => <label className="card row" key={k}><span><b>{t}</b><p>{h}</p></span><input type="checkbox" role="switch" checked={S[k] === true} onChange={(e) => flag(k, e.target.checked)} style={{ width: 32, height: 32, accentColor: "#B91C1C" }} /></label>)}
    {TX.map(([k, l]) => (<section className="card" key={k} style={{ display: "grid", gap: 8 }}><b>{l}</b><p>{typeof S[k] === "string" ? S[k] : "Not set (hidden from visitors)"}</p>
      <input style={inp} value={vals[k] ?? ""} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} placeholder="New value (blank to clear)" aria-label={l} />
      <button className="btn" onClick={async () => { const r = await api("/api/admin/settings", { method: "POST", body: JSON.stringify({ key: k, value: vals[k] ?? "" }) }); setMsg(r.ok ? "Saved." : "That value is not valid."); setVals({ ...vals, [k]: "" }); setN(n + 1); }}>Save</button></section>))}
    {msg && <p role="status">{msg}</p>}
  </>);
}

function Audit() {
  const [d] = useGet<{ items: any[] }>("/api/admin/audit");
  return (<>{(d?.items ?? []).map((a) => <div className="card" key={a.id}><b>{a.action}</b><p>{tm(a.at)} · {a.who || "system"}{a.target_type ? ` · ${a.target_type}` : ""}</p></div>)}</>);
}

export default function AdminHome() {
  const [tab, setTab] = useState<Tab>("Dashboard");
  return (
    <main className="screen" style={{ maxWidth: 960 }}>
      <span className="step">Admin</span><h1>Light Beyond Lamps</h1>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="tablist">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} style={{ minHeight: 44, padding: "0 14px", borderRadius: 22, border: "1px solid var(--line)", background: tab === t ? "var(--nv)" : "#fff", color: tab === t ? "#fff" : "var(--tx)", font: "inherit" }}>{t}</button>)}
        <Link href="/admin/import" className="back">Import people</Link>
      </div>
      {tab === "Dashboard" && <Dashboard />}{tab === "Notify" && <Notify />}{tab === "Screens" && <Screens />}{tab === "Staff" && <Staff />}{tab === "Settings" && <Settings />}{tab === "Audit" && <Audit />}
    </main>
  );
}
