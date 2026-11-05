// pnpm import-people <file.csv> [--dry]  — needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ENC_KEY, ADDRESS_HMAC_KEY
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { plan, run } from "../apps/web/lib/import.ts";
const file = process.argv[2];
if (!file) { console.error("Usage: pnpm import-people <file.csv> [--dry]"); process.exit(1); }
const p = plan(readFileSync(file, "utf8"));
console.log(`${p.rows} rows, ${p.families} families, ${p.errors.length} errors, ${p.warnings.length} warnings`);
[...p.errors, ...p.warnings].forEach((x) => console.log(" -", x));
if (!process.argv.includes("--dry")) {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  console.log(`Imported ${await run(db, p, file)} people.`);
}
