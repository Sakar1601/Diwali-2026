import webpush from "web-push";
import { admin } from "@/lib/supabase-server";
import { dec } from "@/lib/crypto";

export const maxDuration = 60;

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16 || req.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "unauthorized" }, { status: 401 });
  const db = admin();
  const { data: k } = await db.from("settings").select("value").eq("key", "kill_push_sending").maybeSingle();
  if (k?.value === true) return Response.json({ ok: true, paused: true });
  webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);

  // Claim due notifications atomically so two runs never send the same one.
  const { data: due } = await db.from("notifications").update({ sent_at: new Date().toISOString() })
    .is("sent_at", null).lte("send_at", new Date().toISOString()).select("id,title,body,url,destinations");
  let sent = 0;
  for (const n of due ?? []) {
    if (!n.destinations.includes("push")) continue;
    const { data: devs } = await db.from("devices").select("id,push_sub_enc").not("push_sub_enc", "is", null);
    const payload = JSON.stringify({ title: n.title, body: n.body, url: n.url || "/updates" });
    for (let i = 0; i < (devs?.length ?? 0); i += 50) {
      await Promise.all(devs!.slice(i, i + 50).map(async (d) => {
        try { await webpush.sendNotification(JSON.parse(dec(d.push_sub_enc)), payload, { TTL: 3600 }); sent++; }
        catch (e) { const c = (e as { statusCode?: number }).statusCode; if (c === 404 || c === 410) await db.from("devices").update({ push_sub_enc: null }).eq("id", d.id); }
      }));
    }
  }
  return Response.json({ ok: true, notifications: due?.length ?? 0, sent });
}
