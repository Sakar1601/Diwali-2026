import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { addressKey, enc } from "./crypto";

export function parseCsv(t: string): string[][] {
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
type Rec = Record<string, string>;

export function plan(text: string) {
  const [head = [], ...body] = parseCsv(text.replace(/^﻿/, ""));
  const h = head.map((x) => x.trim());
  const recs: Rec[] = body.map((r) => Object.fromEntries(h.map((k, i) => [k, (r[i] ?? "").trim()])));
  const errors: string[] = [], warnings: string[] = [];
  const fams = new Map<string, Rec[]>();
  recs.forEach((r, n) => {
    if (!r.FamilyId || !r.FirstName || !r.LastName) { errors.push(`Row ${n + 2}: missing FamilyId, FirstName or LastName (skipped)`); return; }
    fams.set(r.FamilyId, [...(fams.get(r.FamilyId) ?? []), r]);
  });
  for (const [fam, m] of fams) {
    const prim = m.filter((x) => yes(x.IsPrimary)).length;
    if (prim !== 1) warnings.push(`${fam}: ${prim} primary members (expected 1)`);
    if (m.every((x) => !x.Phone)) warnings.push(`${fam}: nobody has a phone`);
  }
  return { rows: recs.length, families: fams.size, fams, errors, warnings };
}

export async function run(db: SupabaseClient, p: ReturnType<typeof plan>, file: string, by?: string) {
  const famIds = new Map<string, string>();
  const hhRows = [...p.fams].map(([fam, m]) => {
    const prim = m.find((x) => yes(x.IsPrimary) && x.Street) ?? m.find((x) => x.Street);
    const street = prim?.Street ?? "", zip = prim?.ZIP ?? "";
    return { family_id: fam, address_key: addressKey(street, zip), street_enc: enc(street), street_name: street.replace(/^\d+\s*/, ""), city: prim?.City ?? "", zip };
  });
  for (let i = 0; i < hhRows.length; i += 200) {
    const { data, error } = await db.from("households").upsert(hhRows.slice(i, i + 200), { onConflict: "family_id,address_key" }).select("id,family_id");
    if (error) throw new Error("households: " + error.message);
    data!.forEach((d) => famIds.set(d.family_id, d.id));
  }
  const pRows = [...p.fams].flatMap(([fam, m]) => m.map((x) => ({
    person_id: x.PersonId || null, household_id: famIds.get(fam)!, first_name_enc: enc(x.FirstName), last_name_enc: enc(x.LastName),
    bapsid_enc: enc(x.BAPSID), phone_enc: enc(x.Phone), email_enc: enc(x.Email), relation_type: x.RelationType || null,
    is_primary: yes(x.IsPrimary), category: x.Category || null, center: x.Center || null, mandal: x.Mandal || null,
    cell_optout: yes(x.CellOptOut), sms_optout: yes(x.SmsOptOut), email_optout: yes(x.EmailOptOut), mail_optout: yes(x.MailOptOut),
    source: "import", status: "active", verified: true,
  })));
  let imported = 0;
  for (let i = 0; i < pRows.length; i += 200) {
    const { error } = await db.from("people").upsert(pRows.slice(i, i + 200), { onConflict: "person_id" });
    if (error) throw new Error("people: " + error.message);
    imported += Math.min(200, pRows.length - i);
  }
  await db.from("import_batches").insert({ file_name: file, rows_read: p.rows, rows_imported: imported, rows_flagged: p.errors.length + p.warnings.length, created_by: by ?? null });
  return imported;
}
