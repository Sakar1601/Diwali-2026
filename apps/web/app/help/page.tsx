import { PageBar } from "@/components/ui";
import { admin } from "@/lib/supabase-server";
export const revalidate = 60;
export default async function Help() {
  const { data } = await admin().from("settings").select("value").eq("key", "helpdesk_phone").maybeSingle();
  const phone = typeof data?.value === "string" ? data.value : null;
  return (
    <main className="screen narrow">
      <div className="pg">
        <PageBar back="/profile" tag="Help" />
        <div><h1 className="ttl">We are happy to help</h1><p className="lead">You do not need the app to enjoy today. A volunteer can do everything for you.</p></div>
        <div className="grp">
          <div className="li"><span className="dot d-fo" /><div className="grow"><b>Find a volunteer</b><small>Look for a volunteer vest. Say your name or phone number and they will help you.</small></div></div>
          <div className="li"><span className="dot d-in" /><div className="grow"><b>Welcome Desk</b><small>In the Welcome Foyer, near the main doors.</small></div></div>
          {phone && <a className="li" href={`tel:${phone}`}><span className="dot d-ki" /><div className="grow"><b>Call the help desk</b><small>{phone}</small></div><span className="chev">›</span></a>}
        </div>
      </div>
    </main>
  );
}
