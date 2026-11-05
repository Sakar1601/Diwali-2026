import { admin } from "@/lib/supabase-server";
import { audit } from "@/lib/staff-auth";
import { requireAdmin } from "@/lib/admin-auth";
import { plan, run } from "@/lib/import";
import { bust } from "@/lib/people";

export const maxDuration = 60;

export async function POST(req: Request) {
  const staff = await requireAdmin(req);
  if (!staff) return Response.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => null) as { csv?: string; name?: string; commit?: boolean } | null;
  if (!b?.csv || b.csv.length > 4_000_000) return Response.json({ error: "bad_request" }, { status: 400 });
  const p = plan(b.csv);
  const summary = { rows: p.rows, families: p.families, errors: p.errors.slice(0, 50), warnings: p.warnings.slice(0, 50), errorCount: p.errors.length, warningCount: p.warnings.length };
  if (!b.commit) return Response.json({ preview: summary });
  try {
    const n = await run(admin(), p, (b.name || "upload.csv").slice(0, 120), staff.id);
    bust();
    await audit(staff, "import_people", "batch", undefined, { rows: p.rows, imported: n }, req);
    return Response.json({ imported: n, ...summary });
  } catch (e) {
    return Response.json({ error: "import_failed", message: (e as Error).message }, { status: 500 });
  }
}
