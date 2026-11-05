"use client";
import { use, useCallback, useEffect, useState } from "react";
import { api, queueTick, readTicks } from "@/lib/staff-client";
import StaffBar from "@/components/StaffBar";

type Person = { id: string; name: string; relation: string | null; primary: boolean; pending: boolean; phone: string; email: string; prasad: { at: string; station: string | null } | null };
type View = { address: string; calendar: { at: string; station: string | null; extra: boolean; reason?: string }[]; people: Person[] };
const t = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Phoenix" });
const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [v, setV] = useState<View | null>(null); const [busy, setBusy] = useState(false); const [note, setNote] = useState(""); const [ok, setOk] = useState("");
  const [askExtra, setAskExtra] = useState(false); const [reason, setReason] = useState(""); const [missing, setMissing] = useState(false);
  const load = useCallback(async () => { const r = await api(`/api/staff/person/${id}`); if (r.status === 401) return location.replace("/staff"); if (r.status === 404) return setMissing(true); if (r.ok) setV(r.body); }, [id]);
  useEffect(() => { load(); }, [load]);

  async function give(kind: "calendar" | "prasad", personId: string, why?: string) {
    setBusy(true); setNote(""); setOk("");
    const r = await api("/api/staff/give", { method: "POST", body: JSON.stringify({ kind, personId, reason: why }) });
    setBusy(false);
    if (r.status === 409) setNote(kind === "calendar" ? "This household already got today's Calendar." : "Prasad already given today.");
    else if (r.status === 429) setNote("Slow down for a moment, then try again.");
    else if (r.status === 0 || r.status >= 500) { queueTick({ kind, personId, reason: why }); setOk("Saved on this phone. It will send as soon as the connection is back."); setAskExtra(false); setReason(""); }
    else if (!r.ok) setNote("Could not save. Try again.");
    else { setOk(kind === "calendar" ? "Calendar saved." : "Prasad saved."); setAskExtra(false); setReason(""); }
    await load();
  }
  if (missing) return <main className="screen narrow"><div className="pg"><StaffBar title="Not found" back="/staff/search" /><p>That person could not be found.</p></div></main>;
  if (!v) return <main className="screen narrow"><div className="pg"><StaffBar title="Loading…" back="/staff/search" /></div></main>;
  const waiting = (k: string, pid: string) => readTicks().some((x) => x.kind === k && x.personId === pid);
  const got = v.calendar.find((c) => !c.extra);
  return (
    <main className="screen narrow"><div className="pg fl">
      <StaffBar title="Household" back="/staff/search" />
      <p className="mu">{v.address || "No address on file"}</p>
      <section className="card pcard">
        <div className="row"><div><div className="eb">Calendar · one per household</div><b style={{ fontSize: 18 }}>{got ? "Given" : "Not given yet"}</b></div><span className={`chip ${got ? "ok" : "warn"}`}>{got ? `${t(got.at)}${got.station ? ` · ${got.station}` : ""}` : "Today"}</span></div>
        {v.calendar.filter((c) => c.extra).map((c, i) => <p key={i} className="sm mu">Extra at {t(c.at)}{c.reason ? ` · ${c.reason}` : ""}</p>)}
        {!got && !waiting("calendar", v.people[0].id) && <button className="btn btn-p" disabled={busy} onClick={() => give("calendar", v.people[0].id)}>Give Calendar</button>}
        {!got && waiting("calendar", v.people[0].id) && <span className="chip warn">Waiting to send</span>}
        {got && !askExtra && <button className="btn btn-s" disabled={busy} onClick={() => setAskExtra(true)}>Give another (reason needed)</button>}
        {got && askExtra && (<div style={{ display: "grid", gap: 10 }}>
          <textarea className="inp" rows={2} maxLength={200} placeholder="Why does this household need another Calendar?" value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Reason" />
          <div className="row"><button className="btn btn-s" onClick={() => { setAskExtra(false); setReason(""); }}>Cancel</button><button className="btn btn-p" disabled={busy || reason.trim().length < 3} onClick={() => give("calendar", v.people[0].id, reason)}>Give extra</button></div>
        </div>)}
      </section>
      <div className="eb">People in this household</div>
      <div className="grp">{v.people.map((p) => (
        <div className="li pr" key={p.id}>
          <span className="av">{initials(p.name)}</span>
          <div className="grow"><b>{p.name}</b>{p.pending && <span className="chip warn" style={{ marginLeft: 8 }}>Walk-up</span>}<small>{[p.relation, p.phone, p.email].filter(Boolean).join(" · ") || "No contact on file"}</small></div>
          {p.prasad ? <span className="chip ok">Prasad {t(p.prasad.at)}</span> : waiting("prasad", p.id) ? <span className="chip warn">Waiting to send</span> : <button className="btn btn-p mini" disabled={busy} onClick={() => give("prasad", p.id)}>Give Prasad</button>}
        </div>))}</div>
      <div aria-live="polite">{ok && <p style={{ color: "var(--ok)", fontWeight: 700 }}>{ok}</p>}{note && <p role="alert" style={{ color: "var(--er)", fontWeight: 700 }}>{note}</p>}</div>
      <a className="btn btn-s" href="/staff/search">Done, find someone else</a>
    </div></main>
  );
}
