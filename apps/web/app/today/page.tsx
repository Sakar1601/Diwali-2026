import { publicDb } from "@/lib/supabase-public";
import TabBar from "@/components/TabBar";
import TodayView, { type Item } from "@/components/TodayView";
import Link from "next/link";

export const revalidate = 30;

export default async function Today() {
  const { data } = await publicDb().from("schedule_items").select("id,starts_at,ends_at,title,locations(name)").order("starts_at");
  const items: Item[] = (data ?? []).map((r: any) => ({ id: r.id, starts_at: r.starts_at, ends_at: r.ends_at, title: r.title, place: r.locations?.name ?? "" }));
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
        <Link className="row" href="/annakut" style={{ color: "inherit", textDecoration: "none" }}><span><b>What is Annakut?</b><p>A 2-minute guide to today.</p></span>›</Link>
      </section>
      <TabBar active="/today" />
    </main>
  );
}
