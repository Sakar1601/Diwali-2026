import "server-only";
import { requireStaff, type Staff } from "./staff-auth";

// Reads the "aal" claim from a token that requireStaff already verified with Supabase.
export function aalOf(req: Request): string {
  try {
    const t = req.headers.get("authorization")?.replace(/^Bearer /i, "") ?? "";
    return JSON.parse(Buffer.from(t.split(".")[1], "base64url").toString()).aal ?? "aal1";
  } catch { return "aal1"; }
}
export const mfaRequired = () => process.env.REQUIRE_ADMIN_MFA === "1";

export async function requireAdmin(req: Request): Promise<Staff | null> {
  const s = await requireStaff(req);
  if (!s || s.role !== "admin") return null;
  if (mfaRequired() && aalOf(req) !== "aal2") return null;
  return s;
}
export const deny = () => Response.json({ error: "unauthorized" }, { status: 401 });
