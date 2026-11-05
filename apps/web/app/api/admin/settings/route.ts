import { admin } from "@/lib/supabase-server";
import { requireAdmin, deny } from "@/lib/admin-auth";
import { audit } from "@/lib/staff-auth";

const FLAGS = ["kill_visitor_writes", "kill_staff_search", "kill_share_everyone", "kill_push_sending"];
const TEXTS = ["photo_app_url", "whatsapp_url", "instagram_url", "helpdesk_phone"];

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return deny();
  const { data } = await admin().from("settings").select("key,value");
  return Response.json({ settings: Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) });
}
export async function POST(req: Request) {
  const s = await requireAdmin(req); if (!s) return deny();
  const { key, value } = await req.json().catch(() => ({})) as { key?: string; value?: unknown };
  let v: unknown;
  if (key && FLAGS.includes(key) && typeof value === "boolean") v = value;
  else if (key && TEXTS.includes(key) && (value === null || value === "")) v = null;
  else if (key && TEXTS.includes(key) && typeof value === "string" && value.length < 300) {
    if (key === "helpdesk_phone" ? !/^[+\d][\d\s().-]{6,20}$/.test(value) : !/^https:\/\/[^\s]+$/.test(value)) return Response.json({ error: "invalid_value" }, { status: 400 });
    v = value;
  } else return Response.json({ error: "bad_request" }, { status: 400 });
  await admin().from("settings").upsert({ key, value: v as never });
  await audit(s, "setting_change", "setting", key, { value: typeof v === "boolean" ? v : "set" }, req);
  return Response.json({ ok: true });
}
