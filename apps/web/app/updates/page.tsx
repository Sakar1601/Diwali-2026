import { Dock, Hdr } from "@/components/ui";
import { admin } from "@/lib/supabase-server";

export const revalidate = 30;
const tm = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Phoenix" });
export default async function Updates() {
  const { data } = await admin().from("notifications").select("id,title,body,sent_at").not("sent_at", "is", null).contains("destinations", ["feed"]).order("sent_at", { ascending: false }).limit(30);
  const items = data ?? [];
  const recent = items.filter((n) => Date.now() - +new Date(n.sent_at!) < 3600_000), earlier = items.filter((n) => !recent.includes(n));
  const Group = ({ rows, hot }: { rows: typeof items; hot?: boolean }) => (
    <div className="grp">{rows.map((n, i) => (
      <div className="li" key={n.id} style={{ alignItems: "flex-start", background: hot && i === 0 ? "rgba(244,179,26,.07)" : undefined }}>
        <span className="dot d-sh" style={{ marginTop: 8 }} /><div className="grow"><b>{n.title}</b><small>{n.body}</small></div><span className="sm mu" style={{ whiteSpace: "nowrap" }}>{tm(n.sent_at!)}</span>
      </div>))}</div>
  );
  return (
    <main className="screen">
      <div className="pg">
        <Hdr strip={items[0]?.title} />
        <div><div className="eb">Stay in the loop</div><h1 className="ttl" style={{ marginTop: 6 }}>Updates</h1></div>
        {items.length === 0 && <p>No updates yet. Announcements appear here.</p>}
        {recent.length > 0 && <div className="sec"><div className="eb">Just now</div><Group rows={recent} hot /></div>}
        {earlier.length > 0 && <div className="sec"><div className="eb">Earlier</div><Group rows={earlier} /></div>}
      </div>
      <Dock active="/updates" />
    </main>
  );
}
