import { requireStaff } from "@/lib/staff-auth";
import { aalOf, mfaRequired } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const s = await requireStaff(req);
  if (!s) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json({ role: s.role, station: s.station, aal: aalOf(req), mfaRequired: s.role === "admin" && mfaRequired() });
}
