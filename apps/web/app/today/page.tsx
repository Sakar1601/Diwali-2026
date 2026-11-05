import { publicDb } from "@/lib/supabase-public";
import TabBar from "@/components/TabBar";
import TodayView, { type Item } from "@/components/TodayView";
import Link from "next/link";
import { admin } from "@/lib/supabase-server";
import FollowLinks from "@/components/FollowLinks";

export const revalidate = 30;

export default async function Today() {
  const { data } = await publicDb().from("schedule_items").select("id,starts_at,ends_at,title,locations(name)").order("starts_at");
  const items: Item[] = (data ?? []).map((r: any) => ({ id: r.id, starts_at: r.starts_at, ends_at: r.ends_at, title: r.title, place: r.locations?.name ?? "" }));
  const { data: st } = await admin().from("settings").select("key,value").in("key", ["photo_app_url", "whatsapp_url", "instagram_url"]);
  const cfg = Object.fromEntries((st ?? []).map((r) => [r.key, typeof r.value === "string" ? r.value : null]));
  return (
    <main className="screen">
      <header>
        <span className="step">BAPS Swaminarayan Mandir · Phoenix</span>
        <h1>शुभ दीपावली</h1>
        <p>Saturday, Nov 14 · Welcome to the mandir</p>
      </header>
      <TodayView items={items} />
      <section className="card">
        <h2>More to do</h2>
        <Link className="row" href="/booths" style={{ color: "inherit", textDecoration: "none" }}><span><b>Virtual booths</b><p>Six small activities.</p></span>›</Link>
        <Link className="row" href="/profile" style={{ color: "inherit", textDecoration: "none" }}><span><b>Profile</b><p>Text size, reminders, help.</p></span>›</Link>
        <Link className="row" href="/annakut" style={{ color: "inherit", textDecoration: "none" }}><span><b>What is Annakut?</b><p>A 2-minute guide to today.</p></span>›</Link>
      </section>
      <FollowLinks photo={cfg.photo_app_url} whatsapp={cfg.whatsapp_url} instagram={cfg.instagram_url} />
      <TabBar active="/today" />
    </main>
  );
}
