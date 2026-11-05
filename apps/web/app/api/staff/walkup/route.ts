import { randomUUID } from "node:crypto";
import { admin } from "@/lib/supabase-server";
import { addressKey, enc } from "@/lib/crypto";
import { audit, flag, requireStaff } from "@/lib/staff-auth";
import { bust } from "@/lib/people";
import { limited, tooMany } from "@/lib/device-auth";

const clean = (v: unknown, n = 80) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export async function POST(req: Request) {
  const staff = await requireStaff(req);
  if (!staff) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (limited(`sw:${staff.id}`, 30)) return tooMany();
  if (await flag("kill_staff_search")) return Response.json({ error: "paused" }, { status: 503 });
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  const first = clean(b.first), last = clean(b.last), street = clean(b.street, 120), zip = clean(b.zip, 10);
  if (!first || !last || !street || !zip) return Response.json({ error: "missing" }, { status: 400 });
  const db = admin();
  const akey = addressKey(street, zip);
  const fam = `W-${randomUUID().slice(0, 8)}`;
  const { data: hh, error: e1 } = await db.from("households").insert({ family_id: fam, address_key: akey, street_enc: enc(street), street_name: street.replace(/^\d+\s*/, ""), city: clean(b.city), zip }).select("id").single();
  if (e1 || !hh) return Response.json({ error: "failed" }, { status: 500 });
  const { data: p, error: e2 } = await db.from("people").insert({
    household_id: hh.id, first_name_enc: enc(first), last_name_enc: enc(last), phone_enc: enc(clean(b.phone, 20)), email_enc: enc(clean(b.email, 120)),
    is_primary: true, status: "pending", source: "walkup", future_events_consent: b.consent === true, verified: false,
  }).select("id").single();
  if (e2 || !p) return Response.json({ error: "failed" }, { status: 500 });
  bust();
  await audit(staff, "walkup_create", "person", p.id, undefined, req);
  return Response.json({ ok: true, id: p.id });
}
