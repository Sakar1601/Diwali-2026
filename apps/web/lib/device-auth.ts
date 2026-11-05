import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { admin } from "./supabase-server";

export async function requireDevice(req: Request): Promise<string | null> {
  const id = req.headers.get("x-device-id"), secret = req.headers.get("x-device-secret");
  if (!id || !secret || !/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f]{64}$/i.test(secret)) return null;
  const { data } = await admin().from("devices").select("secret_hash").eq("id", id).maybeSingle();
  if (!data) return null;
  const a = Buffer.from(data.secret_hash), b = Buffer.from(createHash("sha256").update(secret).digest("hex"));
  return a.length === b.length && timingSafeEqual(a, b) ? id : null;
}
// Tiny per-instance limiter: slows abuse without a store. Real limits sit in the Vercel firewall.
const hits = new Map<string, number[]>();
export function limited(key: string, max: number, windowMs = 60_000) {
  const now = Date.now(), arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}
