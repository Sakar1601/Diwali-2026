import { admin } from "@/lib/supabase-server";
import { requireAdmin, deny } from "@/lib/admin-auth";
import { today } from "@/lib/staff-auth";

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return deny();
  const db = admin(), day = today();
  const c = async (t: string, f?: (q: any) => any) => { let q = db.from(t).select("*", { count: "exact", head: true }); if (f) q = f(q); return (await q).count ?? 0; };
  const [devices, pushSubs, people, walkups, households, cal, extra, prasad, lamps] = await Promise.all([
    c("devices"), c("devices", (q) => q.not("push_sub_enc", "is", null)), c("people"), c("people", (q) => q.eq("source", "walkup")),
    c("households"), c("calendar_gives", (q) => q.eq("event_day", day).eq("is_extra", false)), c("calendar_gives", (q) => q.eq("event_day", day).eq("is_extra", true)),
    c("prasad_gives", (q) => q.eq("event_day", day).is("voided_at", null)), c("lamp_lights"),
  ]);
  const ev = Object.fromEntries(await Promise.all(["followed_whatsapp", "followed_instagram", "opened_photo_link", "made_moment", "opened_map"].map(async (n) => [n, await c("app_events", (q) => q.eq("name", n))])));
  return Response.json({ day, devices, pushSubs, people, walkups, households, calendar: cal, calendarExtra: extra, prasad, lamps, events: ev });
}
