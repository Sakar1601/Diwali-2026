"use client";
import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/staff-client";

type Person = { id: string; name: string; relation: string | null; primary: boolean; pending: boolean; phone: string; email: string; prasad: { at: string; station: string | null } | null };
type View = { address: string; calendar: { at: string; station: string | null; extra: boolean; reason?: string }[]; people: Person[] };
const t = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Phoenix" });

export default function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [v, setV] = useState<View | null>(null); const [busy, setBusy] = useState(false); const [note, setNote] = useState("");
  const load = useCallback(async () => { const r = await api(`/api/staff/person/${id}`); if (r.status === 401) return location.replace("/staff"); setV(r.body); }, [id]);
  useEffect(() => { load(); }, [load]);

  async function give(kind: "calendar" | "prasad", personId: string, reason?: string) {
    setBusy(true); setNote("");
    const r = await api("/api/staff/give", { method: "POST", body: JSON.stringify({ kind, personId, reason }) });
    setBusy(false);
    if (r.status === 409) setNote(kind === "calendar" ? "This household already got today's Calendar." : "Prasad already given today.");
    else if (!r.ok) setNote("Could not save. Check your connection and try again.");
    await load();
  }
  async function extra(personId: string) {
    const reason = prompt("Why give another Calendar?"); if (reason?.trim()) give("calendar", personId, reason);
  }
  if (!v) return <main className="screen narrow pg"><p>Loading…</p></main>;
  const got = v.calendar.find((c) => !c.extra);
  return (
    <main className="screen pg">
      <Link className="back" href="/staff/search" aria-label="Back to search">‹</Link>
      <p>{v.address}</p>
      <section className="card">
        <h2>Calendar (one per household)</h2>
        {got ? <p style={{ color: "var(--ok)" }}>Given at {t(got.at)}{got.station ? ` · ${got.station}` : ""}</p> : <p>Not given yet today.</p>}
        {v.calendar.filter((c) => c.extra).map((c, i) => <p key={i}>Extra at {t(c.at)}{c.reason ? ` · ${c.reason}` : ""}</p>)}
        {!got && <button className="btn" disabled={busy} onClick={() => give("calendar", v.people[0].id)}>Give Calendar</button>}
        {got && <button className="btn ghost" disabled={busy} onClick={() => extra(v.people[0].id)}>Give another (reason needed)</button>}
      </section>
      {v.people.map((p) => (
        <section className="card" key={p.id}>
          <b>{p.name}</b>{p.pending && <span className="step" style={{ marginLeft: 8 }}>Walk-up</span>}
          <p>{[p.relation, p.phone, p.email].filter(Boolean).join(" · ")}</p>
          {p.prasad ? <p style={{ color: "var(--ok)" }}>Prasad given at {t(p.prasad.at)}{p.prasad.station ? ` · ${p.prasad.station}` : ""}</p>
            : <button className="btn" disabled={busy} onClick={() => give("prasad", p.id)}>Give Prasad</button>}
        </section>
      ))}
      {note && <p role="alert" style={{ color: "var(--er)" }}>{note}</p>}
      <Link className="btn" href="/staff/search">Done</Link>
    </main>
  );
}
