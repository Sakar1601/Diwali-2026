// Usage (from repo root, with env set):  pnpm import-people samples/people-sample.csv [--dry]
// Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ENC_KEY, ADDRESS_HMAC_KEY in the environment.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { addressKey, enc } from "../apps/web/lib/crypto.ts";

function parseCsv(t: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"' && t[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; row.push(f); f = ""; if (row.some((x) => x.trim())) rows.push(row); row = []; }
    else f += c;
  }
  row.push(f); if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}
const yes = (v?: string) => /^(y|yes|true|1)$/i.test((v ?? "").trim());

const file = process.argv[2], dry = process.argv.includes("--dry");
if (!file) { console.error("Usage: pnpm import-people <file.csv> [--dry]"); process.exit(1); }
const [head, ...body] = parseCsv(readFileSync(file, "utf8").replace(/^﻿/, ""));
const idx = Object.fromEntries(head.map((h, i) => [h.trim().toLowerCase(), i]));
const g = (r: string[], k: string) => (r[idx[k.toLowerCase()]] ?? "").trim();

const errors: string[] = [], warnings: string[] = [];
type Rec = Record<string, string>;
const recs: Rec[] = body.map((r) => Object.fromEntries(head.map((h) => [h.trim(), g(r, h.trim())])));
const byFam = new Map<string, Rec[]>();
recs.forEach((r, n) => {
  if (!r.FamilyId || !r.FirstName || !r.LastName) { errors.push(`row ${n + 2}: missing FamilyId/FirstName/LastName, skipped`); return; }
  byFam.set(r.FamilyId, [...(byFam.get(r.FamilyId) ?? []), r]);
});
for (const [fam, m] of byFam) {
  const prim = m.filter((x) => yes(x.IsPrimary)).length;
  if (prim !== 1) warnings.push(`${fam}: ${prim} primary members (expected 1)`);
  if (m.some((x) => !x.Phone) && m.every((x) => !x.Phone)) warnings.push(`${fam}: nobody has a phone`);
}
console.log(`${recs.length} rows, ${byFam.size} families, ${errors.length} errors, ${warnings.length} warnings`);
[...errors, ...warnings].forEach((x) => console.log(" -", x));
if (dry) process.exit(0);

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
let imported = 0;
for (const [fam, m] of byFam) {
  const prim = m.find((x) => yes(x.IsPrimary) && x.Street) ?? m.find((x) => x.Street);
  const street = prim?.Street ?? "", zip = prim?.ZIP ?? "";
  const { data: hh, error } = await db.from("households").upsert(
    { family_id: fam, address_key: addressKey(street, zip), street_enc: enc(street), street_name: street.replace(/^\d+\s*/, ""), city: prim?.City ?? "", zip },
    { onConflict: "family_id,address_key" }).select("id").single();
  if (error || !hh) { console.error(`family ${fam}: ${error?.message}`); continue; }
  for (const p of m) {
    const { error: e } = await db.from("people").upsert({
      person_id: p.PersonId || null, household_id: hh.id, first_name_enc: enc(p.FirstName), last_name_enc: enc(p.LastName),
      bapsid_enc: enc(p.BAPSID), phone_enc: enc(p.Phone), email_enc: enc(p.Email), relation_type: p.RelationType || null,
      is_primary: yes(p.IsPrimary), category: p.Category || null, center: p.Center || null, mandal: p.Mandal || null,
      cell_optout: yes(p.CellOptOut), sms_optout: yes(p.SmsOptOut), email_optout: yes(p.EmailOptOut), mail_optout: yes(p.MailOptOut),
      source: "import", status: "active", verified: true,
    }, { onConflict: "person_id" });
    if (e) console.error(`person ${p.PersonId}: ${e.message}`); else imported++;
  }
}
await db.from("import_batches").insert({ file_name: file, rows_read: recs.length, rows_imported: imported, rows_flagged: errors.length + warnings.length });
console.log(`Imported ${imported} people.`);
