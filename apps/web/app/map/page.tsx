import { Dock, Hdr } from "@/components/ui";
import RouteFinder from "@/components/RouteFinder";
import { publicDb } from "@/lib/supabase-public";
export const revalidate = 60;
export default async function MapPage() {
  const db = publicDb();
  const [{ data: l }, { data: e }] = await Promise.all([db.from("locations").select("id,name,zone").order("name"), db.from("route_edges").select("from_id,to_id,minutes,steps")]);
  return (
    <main className="screen"><div className="pg">
      <Hdr />
      <div><div className="eb">Find your way</div><h1 className="ttl" style={{ marginTop: 6 }}>Map</h1><p className="lead">Pick where you are and where you want to go.</p></div>
      <RouteFinder locations={l ?? []} edges={e ?? []} />
    </div><Dock active="/map" /></main>
  );
}
