import { createHash } from "node:crypto";
import { admin } from "@/lib/supabase-server";
import { ipOf, limited, requireDevice, tooMany } from "@/lib/device-auth";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEX64 = /^[0-9a-f]{64}$/i;

export async function POST(req: Request) {
  if (limited(`reg:${ipOf(req)}`, 20)) return tooMany();
  let body: { id?: unknown; secret?: unknown };
  try { body = await req.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }
  const { id, secret } = body;
  if (typeof id !== "string" || typeof secret !== "string" || !UUID.test(id) || !HEX64.test(secret)) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const db = admin();

  const { data: killed } = await db.from("settings").select("value").eq("key", "kill_visitor_writes").maybeSingle();
  if (killed?.value === true) return Response.json({ ok: true, paused: true });

  const hash = createHash("sha256").update(secret).digest("hex");
  const { data: existing } = await db.from("devices").select("secret_hash").eq("id", id).maybeSingle();
  if (!existing) {
    const { error } = await db.from("devices").insert({ id, secret_hash: hash, last_seen_at: new Date().toISOString() });
    if (error) return Response.json({ ok: false }, { status: 500 });
  } else if (existing.secret_hash === hash) {
    await db.from("devices").update({ last_seen_at: new Date().toISOString() }).eq("id", id);
  } else {
    return Response.json({ ok: false }, { status: 403 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = await requireDevice(req);
  if (!id) return Response.json({ ok: false }, { status: 401 });
  const db = admin();
  await db.from("lamp_lights").delete().eq("device_id", id);
  await db.from("shares").delete().eq("device_id", id);
  await db.from("app_events").delete().eq("device_id", id);
  await db.from("devices").delete().eq("id", id);
  return Response.json({ ok: true });
}
