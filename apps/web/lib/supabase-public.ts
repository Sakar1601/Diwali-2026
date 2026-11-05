import { createClient } from "@supabase/supabase-js";
// Anon key: can only read locations, route_edges, schedule_items (enforced by RLS).
export const publicDb = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
