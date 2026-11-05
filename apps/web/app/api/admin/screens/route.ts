import { createHash, randomBytes } from "node:crypto";
import { admin } from "@/lib/supabase-server";
import { requireAdmin, deny } from "@/lib/admin-auth";
import { audit } from "@/lib/staff-auth";

const TEMPLATES = ["schedule", "message", "wall", "welcome"];
export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return deny();
  const db = admin();
  const [{ data: screens }, { data: items }, { data: tk }] = await Promise.all([
    db.from("screens").select("id,name,orientation,last_seen_at").order("id"),
    db.from("playlist_items").select("id,screen_id,position,template,payload,seconds,active").order("position"),
    db.from("takeovers").select("id,screen_id,payload,ends_at").gt("ends_at", new Date().toISOString()),
  ]);
  return Response.json({ screens: screens ?? [], items: items ?? [], takeovers: tk ?? [] });
}
export async function POST(req: Request) {
  const s = await requireAdmin(req); if (!s) return deny();
  const b = await req.json().catch(() => ({})) as Record<string, any>;
  const db = admin();
  if (b.action === "create_screen") {
    const name = String(b.name || "").trim().slice(0, 40); if (!name) return Response.json({ error: "missing" }, { status: 400 });
    const id = "tv-" + randomBytes(3).toString("hex"), token = randomBytes(24).toString("hex");
    await db.from("screens").insert({ id, name, orientation: b.orientation === "portrait" ? "portrait" : "landscape", token_hash: createHash("sha256").update(token).digest("hex") });
    await audit(s, "screen_create", "screen", id, undefined, req);
    return Response.json({ ok: true, id, url: `/tv/${id}?t=${token}` }); // token shown once
  }
  if (b.action === "add_item" && TEMPLATES.includes(b.template)) {
    const payload = { title: String(b.title || "").slice(0, 80), body: String(b.body || "").slice(0, 240) };
    const { count } = await db.from("playlist_items").select("*", { count: "exact", head: true }).eq("screen_id", b.screen_id);
    await db.from("playlist_items").insert({ screen_id: b.screen_id, position: count ?? 0, template: b.template, payload, seconds: Math.min(60, Math.max(5, Number(b.seconds) || 15)) });
    await audit(s, "playlist_add", "screen", b.screen_id, undefined, req); return Response.json({ ok: true });
  }
  if (b.action === "remove_item") { await db.from("playlist_items").delete().eq("id", b.id); return Response.json({ ok: true }); }
  if (b.action === "takeover") {
    const mins = Math.min(120, Math.max(1, Number(b.minutes) || 10));
    const ids: string[] = b.screen_id === "all" ? ((await db.from("screens").select("id")).data ?? []).map((r) => r.id) : [b.screen_id];
    await db.from("takeovers").insert(ids.map((id) => ({ screen_id: id, payload: { title: String(b.title || "").slice(0, 80), body: String(b.body || "").slice(0, 240) }, ends_at: new Date(Date.now() + mins * 60000).toISOString() })));
    await audit(s, "tv_takeover", "screen", b.screen_id, { mins }, req); return Response.json({ ok: true });
  }
  if (b.action === "end_takeovers") { await db.from("takeovers").delete().gt("ends_at", new Date().toISOString()); return Response.json({ ok: true }); }
  return Response.json({ error: "bad_request" }, { status: 400 });
}
