import "server-only";
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

// AES-256-GCM field encryption. Key lives only in server env (ENC_KEY, base64, 32 bytes).
function key(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set`);
  const b = Buffer.from(v, "base64");
  if (b.length !== 32) throw new Error(`${name} must be 32 bytes base64`);
  return b;
}
// Postgres bytea <-> supabase-js uses "\x..." hex strings.
const toBytea = (b: Buffer) => "\\x" + b.toString("hex");
const fromBytea = (s: string) => Buffer.from(s.startsWith("\\x") ? s.slice(2) : s, "hex");

export function enc(plain: string | null | undefined): string | null {
  if (plain == null || plain === "") return null;
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key("ENC_KEY"), iv);
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return toBytea(Buffer.concat([iv, c.getAuthTag(), ct]));
}
export function dec(field: string | null | undefined): string {
  if (!field) return "";
  const b = fromBytea(field);
  const d = createDecipheriv("aes-256-gcm", key("ENC_KEY"), b.subarray(0, 12));
  d.setAuthTag(b.subarray(12, 28));
  return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString("utf8");
}
export function addressKey(street: string, zip: string) {
  const norm = `${street}|${zip}`.toLowerCase().replace(/[^a-z0-9|]/g, "");
  return createHmac("sha256", key("ADDRESS_HMAC_KEY")).update(norm).digest("hex");
}
