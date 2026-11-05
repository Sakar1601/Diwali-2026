"use client";
import { createClient } from "@supabase/supabase-js";
export const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: "lbl.staff" },
});
export async function api(path: string, init: RequestInit = {}) {
  const { data } = await sb.auth.getSession();
  const token = data.session?.access_token;
  const r = await fetch(path, { ...init, headers: { ...(init.headers || {}), "content-type": "application/json", authorization: `Bearer ${token ?? ""}` } });
  let body: any = null; try { body = await r.json(); } catch { /* empty */ }
  return { ok: r.ok, status: r.status, body };
}
