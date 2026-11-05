import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { admin } from "./supabase-server";

// Verified devices are remembered for a minute per server instance, so a burst of taps does not
// turn into a burst of database reads. Only the hash is kept, never the secret.
const okCache = new Map<string, { h: string; at: number }>();
export async function requireDevice(req: Request): Promise<string | null> {
  const id = req.headers.get("x-device-id"), secret = req.headers.get("x-device-secret");
  if (!id || !secret || !/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f]{64}$/i.test(secret)) return null;
  const h = createHash("sha256").update(secret).digest("hex");
  const hit = okCache.get(id);
  if (hit && Date.now() - hit.at < 60_000) return hit.h === h ? id : null;
  const { data } = await admin().from("devices").select("secret_hash").eq("id", id).maybeSingle();
  if (!data) return null;
  const a = Buffer.from(data.secret_hash), b = Buffer.from(h);
  const ok = a.length === b.length && timingSafeEqual(a, b);
  if (ok) { if (okCache.size > 20000) okCache.clear(); okCache.set(id, { h, at: Date.now() }); }
  return ok ? id : null;
}
export const ipOf = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
export const tooMany = () => Response.json({ error: "slow_down" }, { status: 429, headers: { "retry-after": "30" } });
// Tiny per-instance limiter: slows abuse without a store. Real limits sit in the Vercel firewall.
const hits = new Map<string, number[]>();
export function limited(key: string, max: number, windowMs = 60_000) {
  const now = Date.now(), arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}
