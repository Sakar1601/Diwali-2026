import { admin } from "@/lib/supabase-server";
import { limited, requireDevice } from "@/lib/device-auth";

const ALLOWED = new Set(["followed_whatsapp", "followed_instagram", "opened_photo_link", "opened_map", "opened_guide", "made_moment"]);
export async function POST(req: Request) {
  const id = await requireDevice(req);
  if (!id) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (limited(`ev:${id}`, 60)) return Response.json({ error: "slow_down" }, { status: 429 });
  const { name } = await req.json().catch(() => ({})) as { name?: string };
  if (!name || !ALLOWED.has(name)) return Response.json({ error: "bad_request" }, { status: 400 });
  await admin().from("app_events").insert({ device_id: id, name });
  return Response.json({ ok: true });
}
