import { Dock, Hdr } from "@/components/ui";
import BoothsView from "@/components/BoothsView";
import { admin } from "@/lib/supabase-server";
export const revalidate = 30;
export default async function Page() {
  const { data } = await admin().from("notifications").select("title").not("sent_at", "is", null).contains("destinations", ["feed"]).order("sent_at", { ascending: false }).limit(1);
  return (<main className="screen"><div className="pg"><Hdr strip={data?.[0]?.title} /><BoothsView /></div><Dock active="/booths" /></main>);
}
