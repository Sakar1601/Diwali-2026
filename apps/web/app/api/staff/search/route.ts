import { audit, flag, requireStaff } from "@/lib/staff-auth";
import { index, maskEmail, maskPhone, search } from "@/lib/people";

export async function GET(req: Request) {
  const staff = await requireStaff(req);
  if (!staff) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (await flag("kill_staff_search")) return Response.json({ error: "paused" }, { status: 503 });
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const res = search(await index(), q);
  await audit(staff, "search", "query", undefined, { len: q.length, hits: res.length }, req);
  const full = staff.role === "admin";
  return Response.json({
    results: res.map((p) => ({ id: p.id, name: `${p.first} ${p.last}`.trim(), phone: full ? p.phone : maskPhone(p.phone), email: full ? p.email : maskEmail(p.email), pending: p.status === "pending" })),
  });
}
