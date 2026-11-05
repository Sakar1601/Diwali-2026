import "server-only";
import { requireStaff, type Staff } from "./staff-auth";
export async function requireAdmin(req: Request): Promise<Staff | null> {
  const s = await requireStaff(req);
  return s && s.role === "admin" ? s : null;
}
export const deny = () => Response.json({ error: "unauthorized" }, { status: 401 });
