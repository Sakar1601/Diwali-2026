import { admin } from "@/lib/supabase-server";
import { dec } from "@/lib/crypto";
import { audit, requireStaff, today } from "@/lib/staff-auth";
import { maskEmail, maskPhone } from "@/lib/people";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const staff = await requireStaff(req);
  if (!staff) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const db = admin(), day = today(), full = staff.role === "admin";
  const { data: me } = await db.from("people").select("household_id").eq("id", id).maybeSingle();
  if (!me) return Response.json({ error: "not_found" }, { status: 404 });
  const { data: hh } = await db.from("households").select("id,street_enc,street_name,city,zip").eq("id", me.household_id).single();
  const { data: ppl } = await db.from("people").select("id,first_name_enc,last_name_enc,phone_enc,email_enc,relation_type,is_primary,status").eq("household_id", me.household_id);
  const ids = (ppl ?? []).map((p) => p.id);
  const [{ data: cal }, { data: pras }] = await Promise.all([
    db.from("calendar_gives").select("given_at,station,is_extra,extra_reason,given_by").eq("household_id", me.household_id).eq("event_day", day).order("given_at"),
    db.from("prasad_gives").select("person_id,given_at,station,given_by").eq("event_day", day).in("person_id", ids).is("voided_at", null),
  ]);
  await audit(staff, "view_person", "person", id, undefined, req);
  const pm = new Map((pras ?? []).map((r) => [r.person_id, r]));
  return Response.json({
    day,
    address: full ? `${dec(hh?.street_enc)}, ${hh?.city ?? ""} ${hh?.zip ?? ""}`.trim() : `${hh?.street_name ?? ""}, ${hh?.city ?? ""}`.trim(),
    calendar: (cal ?? []).map((c) => ({ at: c.given_at, station: c.station, extra: c.is_extra, reason: full ? c.extra_reason : undefined, by: full ? c.given_by : undefined })),
    people: (ppl ?? []).map((p) => {
      const ph = dec(p.phone_enc), em = dec(p.email_enc), pr = pm.get(p.id);
      return { id: p.id, name: `${dec(p.first_name_enc)} ${dec(p.last_name_enc)}`.trim(), relation: p.relation_type, primary: p.is_primary, pending: p.status === "pending", phone: full ? ph : maskPhone(ph), email: full ? em : maskEmail(em), prasad: pr ? { at: pr.given_at, station: pr.station, by: full ? pr.given_by : undefined } : null };
    }),
  });
}
