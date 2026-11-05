import { createHash, timingSafeEqual } from "node:crypto";
import { admin } from "@/lib/supabase-server";
import { ipOf, limited, tooMany } from "@/lib/device-auth";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (limited(`tv:${ipOf(req)}`, 120)) return tooMany();
  const { id } = await ctx.params, t = new URL(req.url).searchParams.get("t") ?? "";
  const db = admin();
  const { data: sc } = await db.from("screens").select("id,name,orientation,token_hash").eq("id", id).maybeSingle();
  const h = createHash("sha256").update(t).digest("hex");
  if (!sc || sc.token_hash.length !== h.length || !timingSafeEqual(Buffer.from(sc.token_hash), Buffer.from(h))) return Response.json({ error: "unauthorized" }, { status: 401 });
  await db.from("screens").update({ last_seen_at: new Date().toISOString() }).eq("id", id);
  const now = new Date().toISOString();
  const [{ data: tk }, { data: items }, { data: sched }, { count: lamps }] = await Promise.all([
    db.from("takeovers").select("payload").eq("screen_id", id).lte("starts_at", now).gt("ends_at", now).order("starts_at", { ascending: false }).limit(1),
    db.from("playlist_items").select("template,payload,seconds").eq("screen_id", id).eq("active", true).order("position"),
    db.from("schedule_items").select("starts_at,ends_at,title,locations(name)").gte("ends_at", now).order("starts_at").limit(6),
    db.from("lamp_lights").select("*", { count: "exact", head: true }),
  ]);
  return Response.json({ name: sc.name, orientation: sc.orientation, takeover: tk?.[0]?.payload ?? null, items: items ?? [], schedule: (sched ?? []).map((r: any) => ({ starts_at: r.starts_at, title: r.title, place: r.locations?.name ?? "" })), lamps: lamps ?? 0 }, { headers: { "cache-control": "no-store" } });
}
