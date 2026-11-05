import "server-only";
import { admin } from "./supabase-server";

export type Staff = { id: string; email: string; role: "admin" | "coordinator" | "volunteer"; station: string | null };

export async function requireStaff(req: Request): Promise<Staff | null> {
  const token = req.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token) return null;
  const db = admin();
  const { data } = await db.auth.getUser(token);
  const u = data.user;
  if (!u?.email) return null;
  let { data: s } = await db.from("staff").select("id,email,role,station,active").eq("id", u.id).maybeSingle();
  if (!s) {
    // First sign-in claims a pending invite for this verified email.
    const { data: inv } = await db.from("staff_invites").select("*").eq("email", u.email.toLowerCase()).maybeSingle();
    if (!inv || !u.email_confirmed_at) return null;
    await db.from("staff").insert({ id: u.id, email: inv.email, role: inv.role, station: inv.station, active: true });
    await db.from("staff_invites").delete().eq("email", inv.email);
    s = { id: u.id, email: inv.email, role: inv.role, station: inv.station, active: true };
  }
  if (!s.active) return null;
  return { id: s.id, email: s.email, role: s.role, station: s.station };
}

export async function audit(staff: Staff, action: string, target_type?: string, target_id?: string, detail?: object, req?: Request) {
  const ip = req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  await admin().from("audit_log").insert({ staff_id: staff.id, action, target_type, target_id, detail, ip: ip || null });
}

export async function flag(key: string) {
  const { data } = await admin().from("settings").select("value").eq("key", key).maybeSingle();
  return data?.value === true;
}
export const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Phoenix" }).format(new Date());
