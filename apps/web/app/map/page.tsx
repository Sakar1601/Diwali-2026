import TabBar from "@/components/TabBar";
import RouteFinder from "@/components/RouteFinder";
import { publicDb } from "@/lib/supabase-public";
export const revalidate = 60;
export default async function MapPage() {
  const db = publicDb();
  const [{ data: l }, { data: e }] = await Promise.all([db.from("locations").select("id,name").order("name"), db.from("route_edges").select("from_id,to_id,minutes,steps")]);
  return (<main className="screen"><h1>Map</h1><p>Pick where you are and where you want to go.</p><RouteFinder locations={l ?? []} edges={e ?? []} /><TabBar active="/map" /></main>);
}
