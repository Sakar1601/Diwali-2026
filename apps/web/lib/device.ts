"use client";
// The phone holds only settings plus a random device id and secret that are never shown.
const K = { id: "lbl.device", secret: "lbl.secret", settings: "lbl.settings", done: "lbl.onboarded" };

export type Settings = { reminders: boolean; wayfinding: boolean; large: boolean; contrast: boolean };
const DEFAULTS: Settings = { reminders: false, wayfinding: false, large: false, contrast: false };

function rnd(bytes: number) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}
function get(k: string) { try { return localStorage.getItem(k); } catch { return null; } }
function set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* storage blocked: app still works */ } }

export function getSettings(): Settings {
  try { return { ...DEFAULTS, ...JSON.parse(get(K.settings) || "{}") }; } catch { return DEFAULTS; }
}
export function saveSettings(s: Partial<Settings>) {
  const next = { ...getSettings(), ...s };
  set(K.settings, JSON.stringify(next));
  applySettings(next);
  return next;
}
export function applySettings(s = getSettings()) {
  document.body.dataset.large = s.large ? "1" : "0";
  document.body.dataset.contrast = s.contrast ? "1" : "0";
}
export const isOnboarded = () => get(K.done) === "1";
export const markOnboarded = () => set(K.done, "1");
export const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;

export async function ensureDevice(): Promise<void> {
  let id = get(K.id), secret = get(K.secret);
  if (!id || !secret) {
    id = crypto.randomUUID(); secret = rnd(32);
    set(K.id, id); set(K.secret, secret);
  }
  try {
    await fetch("/api/device", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, secret }) });
  } catch { /* offline: retried next open */ }
}
