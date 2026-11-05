import { admin } from "@/lib/supabase-server";
import { requireAdmin, deny } from "@/lib/admin-auth";
import { audit } from "@/lib/staff-auth";

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return deny();
  const { data } = await admin().from("notifications").select("id,title,body,url,destinations,send_at,sent_at").order("send_at", { ascending: false }).limit(50);
  return Response.json({ items: data ?? [] });
}
export async function POST(req: Request) {
  const s = await requireAdmin(req); if (!s) return deny();
  const b = await req.json().catch(() => ({})) as { title?: string; body?: string; url?: string; sendAt?: string; push?: boolean; feed?: boolean; id?: string; cancel?: boolean };
  const db = admin();
  if (b.id && b.cancel) { await db.from("notifications").delete().eq("id", b.id).is("sent_at", null); await audit(s, "notify_cancel", "notification", b.id, undefined, req); return Response.json({ ok: true }); }
  const title = b.title?.trim().slice(0, 80), body = b.body?.trim().slice(0, 200);
  const dest = [b.push && "push", b.feed !== false && "feed", "tv"].filter(Boolean) as string[];
  if (!title || !body) return Response.json({ error: "missing" }, { status: 400 });
  if (b.url && !/^(\/[\w\-/?=&.]*|https:\/\/[^\s]+)$/.test(b.url)) return Response.json({ error: "bad_url" }, { status: 400 });
  const at = b.sendAt ? new Date(b.sendAt) : new Date();
  if (isNaN(+at)) return Response.json({ error: "bad_time" }, { status: 400 });
  const { data, error } = await db.from("notifications").insert({ title, body, url: b.url || null, destinations: dest, send_at: at.toISOString(), created_by: s.id }).select("id").single();
  if (error) return Response.json({ error: "failed" }, { status: 500 });
  await audit(s, "notify_create", "notification", data.id, { push: !!b.push }, req);
  return Response.json({ ok: true, id: data.id });
}
