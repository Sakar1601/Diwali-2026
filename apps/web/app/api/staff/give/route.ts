import { admin } from "@/lib/supabase-server";
import { audit, flag, requireStaff, today } from "@/lib/staff-auth";
import { limited, tooMany } from "@/lib/device-auth";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const staff = await requireStaff(req);
  if (!staff) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (limited(`sg:${staff.id}`, 120)) return tooMany();
  if (await flag("kill_staff_search")) return Response.json({ error: "paused" }, { status: 503 });
  const b = await req.json().catch(() => null) as { kind?: string; personId?: string; householdId?: string; reason?: string } | null;
  const db = admin(), day = today();
  if (!b?.personId || !UUID.test(b.personId)) return Response.json({ error: "bad_request" }, { status: 400 });
  if (b?.kind === "prasad" && b.personId) {
    const { error } = await db.from("prasad_gives").insert({ event_day: day, person_id: b.personId, given_by: staff.id, station: staff.station });
    if (error?.code === "23505") return Response.json({ error: "already" }, { status: 409 });
    if (error) return Response.json({ error: "failed" }, { status: 500 });
    await audit(staff, "give_prasad", "person", b.personId, undefined, req);
    return Response.json({ ok: true });
  }
  if (b?.kind === "calendar" && b.personId) {
    const { data: p } = await db.from("people").select("id,household_id").eq("id", b.personId).maybeSingle();
    if (!p) return Response.json({ error: "not_found" }, { status: 404 });
    const extra = !!b.reason?.trim();
    const { error } = await db.from("calendar_gives").insert({ event_day: day, household_id: p.household_id, received_by: p.id, given_by: staff.id, station: staff.station, is_extra: extra, extra_reason: extra ? b.reason!.trim().slice(0, 200) : null });
    if (error?.code === "23505") return Response.json({ error: "already" }, { status: 409 });
    if (error) return Response.json({ error: "failed" }, { status: 500 });
    await audit(staff, extra ? "give_calendar_extra" : "give_calendar", "household", p.household_id, extra ? { reason: b.reason } : undefined, req);
    return Response.json({ ok: true });
  }
  return Response.json({ error: "bad_request" }, { status: 400 });
}
