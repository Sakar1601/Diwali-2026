import { createClient } from "@supabase/supabase-js";
import { admin } from "@/lib/supabase-server";
import { ipOf, limited, tooMany } from "@/lib/device-auth";

// Sends a sign-in code ONLY to emails that are already staff or invited. Always answers the same,
// so it cannot be used to discover who is on the team or to email strangers.
export async function POST(req: Request) {
  if (limited(`otp:${ipOf(req)}`, 6, 10 * 60_000)) return tooMany();
  const { email } = await req.json().catch(() => ({})) as { email?: string };
  const e = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || e.length > 120) return Response.json({ ok: true });
  if (limited(`otpe:${e}`, 3, 10 * 60_000)) return Response.json({ ok: true });
  const db = admin();
  const [{ data: s }, { data: i }] = await Promise.all([
    db.from("staff").select("id").eq("email", e).eq("active", true).maybeSingle(),
    db.from("staff_invites").select("email").eq("email", e).maybeSingle(),
  ]);
  if (s || i) {
    const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
    await anon.auth.signInWithOtp({ email: e, options: { shouldCreateUser: true } });
  }
  return Response.json({ ok: true });
}
