"use client";
import { useEffect, useMemo, useState } from "react";
import { track } from "@/lib/device";

type L = { id: string; name: string }; type E = { from_id: string; to_id: string; minutes: number; steps: string[] | null };
export default function RouteFinder({ locations, edges }: { locations: L[]; edges: E[] }) {
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  useEffect(() => { const f = new URLSearchParams(location.search).get("from"); if (f) setFrom(f); track("opened_map"); }, []);
  const path = useMemo(() => {
    if (!from || !to || from === to) return null;
    const adj = new Map<string, E[]>(); edges.forEach((e) => { adj.set(e.from_id, [...(adj.get(e.from_id) ?? []), e]); adj.set(e.to_id, [...(adj.get(e.to_id) ?? []), { ...e, from_id: e.to_id, to_id: e.from_id }]); });
    const dist = new Map([[from, 0]]), prev = new Map<string, E>(), todo = [from];
    while (todo.length) { todo.sort((a, b) => dist.get(a)! - dist.get(b)!); const u = todo.shift()!; if (u === to) break;
      for (const e of adj.get(u) ?? []) { const d = dist.get(u)! + e.minutes; if (d < (dist.get(e.to_id) ?? 1e9)) { dist.set(e.to_id, d); prev.set(e.to_id, e); todo.push(e.to_id); } } }
    if (!prev.has(to)) return [];
    const out: E[] = []; for (let c = to; c !== from; c = prev.get(c)!.from_id) out.unshift(prev.get(c)!); return out;
  }, [from, to, edges]);
  const name = (id: string) => locations.find((l) => l.id === id)?.name ?? id;
  const sel = { minHeight: 52, borderRadius: 12, border: "1px solid var(--line)", padding: "0 12px", font: "inherit", width: "100%", background: "#fff" } as const;
  return (
    <>
      <label style={{ display: "grid", gap: 6 }}>Where are you?<select style={sel} value={from} onChange={(e) => setFrom(e.target.value)}><option value="">Choose</option>{locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
      <label style={{ display: "grid", gap: 6 }}>Where to?<select style={sel} value={to} onChange={(e) => setTo(e.target.value)}><option value="">Choose</option>{locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
      {path && path.length === 0 && <p>Walking directions for this trip are not ready yet. Please ask a volunteer.</p>}
      {path && path.length > 0 && (
        <section className="card"><h2>About {path.reduce((a, e) => a + e.minutes, 0)} min</h2>
          {path.map((e, i) => <div key={i}><b>{name(e.from_id)} → {name(e.to_id)}</b>{(e.steps ?? []).map((s, j) => <p key={j}>{s}</p>)}</div>)}</section>
      )}
    </>
  );
}
