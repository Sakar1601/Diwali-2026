"use client";
import { createClient } from "@supabase/supabase-js";
export const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: "lbl.staff" },
});
// status 0 means "no connection or too slow", so screens can tell that apart from a real refusal.
export async function api(path: string, init: RequestInit = {}, ms = 10000) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  try {
    const { data } = await sb.auth.getSession();
    const token = data.session?.access_token;
    const r = await fetch(path, { ...init, signal: c.signal, headers: { ...(init.headers || {}), "content-type": "application/json", authorization: `Bearer ${token ?? ""}` } });
    let body: any = null; try { body = await r.json(); } catch { /* empty */ }
    return { ok: r.ok, status: r.status, body };
  } catch { return { ok: false, status: 0, body: null as any }; }
  finally { clearTimeout(t); }
}

// Calendar and Prasad ticks are kept on the phone until the server confirms them.
// Repeats are safe: the server answers 409 "already" for a tick it has, which counts as done.
export type Tick = { kind: "calendar" | "prasad"; personId: string; reason?: string; t: number };
const KEY = "lbl.staff.outbox";
export const readTicks = (): Tick[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const writeTicks = (q: Tick[]) => { try { localStorage.setItem(KEY, JSON.stringify(q)); window.dispatchEvent(new Event("lbl-outbox")); } catch { /* ignore */ } };
export function queueTick(k: Omit<Tick, "t">) {
  const q = readTicks(); if (!q.some((x) => x.kind === k.kind && x.personId === k.personId)) q.push({ ...k, t: Date.now() }); writeTicks(q);
}
let busy = false;
export async function flushTicks(): Promise<number> {
  if (busy) return readTicks().length; busy = true;
  try {
    const keep: Tick[] = [];
    for (const j of readTicks()) {
      const r = await api("/api/staff/give", { method: "POST", body: JSON.stringify({ kind: j.kind, personId: j.personId, reason: j.reason }) });
      if (r.status === 0 || r.status === 429 || r.status >= 500) keep.push(j);
      else if (r.status === 401) keep.push(j);
    }
    writeTicks(keep); return keep.length;
  } finally { busy = false; }
}
