import { admin } from "@/lib/supabase-server";
import { limited, requireDevice } from "@/lib/device-auth";
import { BOOTHS } from "@/lib/booths";

export async function GET(req: Request) {
  const id = await requireDevice(req);
  const db = admin();
  const { count } = await db.from("lamp_lights").select("*", { count: "exact", head: true });
  let mine: string[] = [];
  if (id) mine = ((await db.from("lamp_lights").select("booth").eq("device_id", id)).data ?? []).map((r) => r.booth);
  return Response.json({ mine, total: count ?? 0 });
}
export async function POST(req: Request) {
  const id = await requireDevice(req);
  if (!id) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (limited(`lamp:${id}`, 20)) return Response.json({ error: "slow_down" }, { status: 429 });
  const { booth } = await req.json().catch(() => ({})) as { booth?: string };
  if (!BOOTHS.some((b) => b.slug === booth)) return Response.json({ error: "bad_request" }, { status: 400 });
  const db = admin();
  const { data: k } = await db.from("settings").select("value").eq("key", "kill_visitor_writes").maybeSingle();
  if (k?.value === true) return Response.json({ ok: true, paused: true });
  await db.from("lamp_lights").upsert({ device_id: id, booth }, { onConflict: "device_id,booth", ignoreDuplicates: true });
  return Response.json({ ok: true });
}
