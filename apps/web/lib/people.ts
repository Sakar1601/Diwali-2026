import "server-only";
import { admin } from "./supabase-server";
import { dec } from "./crypto";

export type P = { id: string; first: string; last: string; phone: string; email: string; household_id: string; relation: string | null; status: string };
let cache: { at: number; rows: P[] } | null = null;
const TTL = 60_000;

// Decrypted search index held in server memory only (never stored), rebuilt on a short TTL.
export async function index(force = false): Promise<P[]> {
  if (!force && cache && Date.now() - cache.at < TTL) return cache.rows;
  const rows: P[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin().from("people")
      .select("id,household_id,first_name_enc,last_name_enc,phone_enc,email_enc,relation_type,status")
      .range(from, from + 999);
    if (error) throw error;
    for (const r of data ?? []) rows.push({ id: r.id, household_id: r.household_id, first: dec(r.first_name_enc), last: dec(r.last_name_enc), phone: dec(r.phone_enc), email: dec(r.email_enc), relation: r.relation_type, status: r.status });
    if (!data || data.length < 1000) break;
  }
  cache = { at: Date.now(), rows };
  return rows;
}
export const bust = () => { cache = null; };

export function search(rows: P[], q: string, limit = 20): P[] {
  const s = q.trim().toLowerCase();
  if (s.length < 2) return [];
  const digits = s.replace(/\D/g, "");
  const toks = s.split(/\s+/).filter(Boolean);
  return rows.filter((p) => {
    if (digits.length >= 4 && p.phone.replace(/\D/g, "").endsWith(digits)) return true;
    if (s.includes("@")) return p.email.toLowerCase().startsWith(s);
    const hay = `${p.first} ${p.last}`.toLowerCase();
    return toks.every((t) => hay.split(/\s+/).some((w) => w.startsWith(t)));
  }).slice(0, limit);
}
export const maskPhone = (p: string) => (p.replace(/\D/g, "").length >= 4 ? `•••-•••-${p.replace(/\D/g, "").slice(-4)}` : "");
export const maskEmail = (e: string) => { const [u, d] = e.split("@"); return u && d ? `${u[0]}•••@${d}` : ""; };
