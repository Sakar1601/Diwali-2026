import { admin } from "@/lib/supabase-server";
import { requireAdmin, deny } from "@/lib/admin-auth";
export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return deny();
  const { data } = await admin().from("audit_log").select("id,at,staff_id,action,target_type,target_id").order("id", { ascending: false }).limit(100);
  const ids = [...new Set((data ?? []).map((r) => r.staff_id).filter(Boolean))];
  const { data: st } = await admin().from("staff").select("id,email").in("id", ids);
  const em = new Map((st ?? []).map((x) => [x.id, x.email]));
  return Response.json({ items: (data ?? []).map((r) => ({ ...r, who: em.get(r.staff_id) ?? "" })) });
}
