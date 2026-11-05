import Link from "next/link";
import { admin } from "@/lib/supabase-server";
export const revalidate = 60;
export default async function Help() {
  const { data } = await admin().from("settings").select("value").eq("key", "helpdesk_phone").maybeSingle();
  const phone = typeof data?.value === "string" ? data.value : null;
  return (
    <main className="screen">
      <Link href="/profile">‹ Profile</Link>
      <h1>Help and volunteers</h1>
      <section className="card"><h2>Need help?</h2><p style={{ color: "var(--tx)" }}>Look for a volunteer in a mandir-colored vest, or visit the Help Desk near the entrance.</p>
        {phone && <a className="btn" href={`tel:${phone}`} style={{ marginTop: 12 }}>Call the Help Desk</a>}</section>
      <section className="card"><h2>Lost something or someone?</h2><p style={{ color: "var(--tx)" }}>Go to the Help Desk. Volunteers will help you right away.</p></section>
    </main>
  );
}
