import TabBar from "@/components/TabBar";
import { admin } from "@/lib/supabase-server";

export const revalidate = 30;
export default async function Updates() {
  const { data } = await admin().from("notifications").select("id,title,body,sent_at,destinations").not("sent_at", "is", null).contains("destinations", ["feed"]).order("sent_at", { ascending: false }).limit(30);
  return (
    <main className="screen">
      <h1>Updates</h1>
      {(data ?? []).length === 0 && <p>No updates yet. Announcements appear here.</p>}
      {(data ?? []).map((n) => (
        <section className="card" key={n.id}>
          <span className="step">{new Date(n.sent_at!).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Phoenix" })}</span>
          <h2>{n.title}</h2><p style={{ color: "var(--tx)" }}>{n.body}</p>
        </section>
      ))}
      <TabBar active="/updates" />
    </main>
  );
}
