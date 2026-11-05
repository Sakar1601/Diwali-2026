import { admin } from "@/lib/supabase-server";
import { requireAdmin, deny } from "@/lib/admin-auth";
import { audit } from "@/lib/staff-auth";

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return deny();
  const db = admin();
  const [{ data: staff }, { data: invites }] = await Promise.all([db.from("staff").select("id,email,role,station,active").order("email"), db.from("staff_invites").select("email,role,station")]);
  return Response.json({ staff: staff ?? [], invites: invites ?? [] });
}
export async function POST(req: Request) {
  const s = await requireAdmin(req); if (!s) return deny();
  const b = await req.json().catch(() => ({})) as { email?: string; role?: string; station?: string; id?: string; active?: boolean; removeInvite?: string };
  const db = admin();
  if (b.id && typeof b.active === "boolean") {
    if (b.id === s.id) return Response.json({ error: "not_yourself" }, { status: 400 });
    await db.from("staff").update({ active: b.active }).eq("id", b.id); await audit(s, b.active ? "staff_enable" : "staff_disable", "staff", b.id, undefined, req); return Response.json({ ok: true });
  }
  if (b.removeInvite) { await db.from("staff_invites").delete().eq("email", b.removeInvite); return Response.json({ ok: true }); }
  const email = b.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !["admin", "coordinator", "volunteer"].includes(b.role ?? "")) return Response.json({ error: "bad_request" }, { status: 400 });
  await db.from("staff_invites").upsert({ email, role: b.role!, station: b.station?.trim().slice(0, 40) || null });
  await audit(s, "staff_invite", "staff", email, { role: b.role }, req);
  return Response.json({ ok: true });
}
