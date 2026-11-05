import { redirect } from "next/navigation";
import { publicDb } from "@/lib/supabase-public";
// Poster QR codes and NFC tags open /go/<waypoint code>; this page needs no install or sign-in.
export default async function Go({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { data } = await publicDb().from("locations").select("id").eq("waypoint_code", code.toUpperCase()).maybeSingle();
  redirect(data ? `/map?from=${data.id}` : "/map");
}
