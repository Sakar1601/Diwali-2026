import { publicDb } from "@/lib/supabase-public";
import { admin } from "@/lib/supabase-server";
import { Dock, Hdr } from "@/components/ui";
import TodayView, { type Item } from "@/components/TodayView";

export const revalidate = 30;

export default async function Today() {
  const [{ data }, { data: st }, { data: latest }] = await Promise.all([
    publicDb().from("schedule_items").select("id,starts_at,ends_at,title,locations(name,zone)").order("starts_at"),
    admin().from("settings").select("key,value").in("key", ["photo_app_url", "whatsapp_url", "instagram_url"]),
    admin().from("notifications").select("title").not("sent_at", "is", null).contains("destinations", ["feed"]).order("sent_at", { ascending: false }).limit(1),
  ]);
  const items: Item[] = (data ?? []).map((r: any) => ({ id: r.id, starts_at: r.starts_at, ends_at: r.ends_at, title: r.title, place: r.locations?.name ?? "", zone: r.locations?.zone ?? "" }));
  const cfg = Object.fromEntries((st ?? []).map((r) => [r.key, typeof r.value === "string" ? r.value : null]));
  return (
    <main className="screen">
      <div className="pg">
        <Hdr strip={latest?.[0]?.title} />
        <TodayView items={items} photo={cfg.photo_app_url} whatsapp={cfg.whatsapp_url} instagram={cfg.instagram_url} />
      </div>
      <Dock active="/today" />
    </main>
  );
}
