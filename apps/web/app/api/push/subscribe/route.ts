import { admin } from "@/lib/supabase-server";
import { enc } from "@/lib/crypto";
import { limited, requireDevice } from "@/lib/device-auth";

export async function POST(req: Request) {
  const id = await requireDevice(req);
  if (!id) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (limited(`push:${id}`, 10)) return Response.json({ error: "slow_down" }, { status: 429 });
  const { subscription: s } = await req.json().catch(() => ({})) as { subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } } };
  if (!s?.endpoint?.startsWith("https://") || !s.keys?.p256dh || !s.keys?.auth) return Response.json({ error: "bad_request" }, { status: 400 });
  await admin().from("devices").update({ push_sub_enc: enc(JSON.stringify({ endpoint: s.endpoint, keys: s.keys })) }).eq("id", id);
  return Response.json({ ok: true });
}
