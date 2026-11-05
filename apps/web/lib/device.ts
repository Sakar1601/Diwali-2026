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

// fetch that gives up instead of hanging forever on a weak connection.
export async function tfetch(url: string, init: RequestInit = {}, ms = 8000): Promise<Response> {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  try { return await fetch(url, { ...init, signal: c.signal }); } finally { clearTimeout(t); }
}

// Registers this phone once. After that it never calls the server just to open a page.
let registering: Promise<void> | null = null;
export function ensureDevice(): Promise<void> {
  if (get(K.id) && get(K.secret) && get("lbl.registered") === "1") return Promise.resolve();
  if (registering) return registering;
  registering = (async () => {
    let id = get(K.id), secret = get(K.secret);
    if (!id || !secret) { id = crypto.randomUUID(); secret = rnd(32); set(K.id, id); set(K.secret, secret); }
    try {
      const r = await tfetch("/api/device", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, secret }) });
      if (r.ok) set("lbl.registered", "1");
    } catch { /* offline: tried again next time */ }
    finally { registering = null; }
  })();
  return registering;
}

// Writes that fail on a bad connection wait in the phone and are sent when it comes back.
type Job = { path: string; body: unknown; t: number };
const OUT = "lbl.outbox";
const readOut = (): Job[] => { try { return JSON.parse(get(OUT) || "[]"); } catch { return []; } };
export function queueWrite(path: string, body: unknown) {
  const q = readOut().filter((j) => !(j.path === path && JSON.stringify(j.body) === JSON.stringify(body)));
  q.push({ path, body, t: Date.now() });
  set(OUT, JSON.stringify(q.slice(-40)));
}
let flushing = false;
export async function flushOutbox() {
  if (flushing) return; flushing = true;
  try {
    await ensureDevice();
    const keep: Job[] = [];
    for (const j of readOut()) {
      if (Date.now() - j.t > 24 * 3600_000) continue;
      try {
        const r = await tfetch(j.path, { method: "POST", headers: deviceHeaders(), body: JSON.stringify(j.body) });
        if (r.status === 429 || r.status >= 500) keep.push(j);
      } catch { keep.push(j); }
    }
    set(OUT, JSON.stringify(keep));
  } finally { flushing = false; }
}
// Sends now; if the network fails, queues it and reports "queued" so the screen can still react.
export async function writeOrQueue(path: string, body: unknown): Promise<"ok" | "queued" | "rejected"> {
  try {
    await ensureDevice();
    const r = await tfetch(path, { method: "POST", headers: deviceHeaders(), body: JSON.stringify(body) });
    if (r.ok) return "ok";
    if (r.status === 429 || r.status >= 500 || r.status === 401) { queueWrite(path, body); return "queued"; }
    return "rejected";
  } catch { queueWrite(path, body); return "queued"; }
}

export function deviceHeaders(): Record<string, string> {
  return { "x-device-id": get(K.id) || "", "x-device-secret": get(K.secret) || "", "content-type": "application/json" };
}
export async function removeMyData() {
  try { await fetch("/api/device", { method: "DELETE", headers: deviceHeaders() }); } catch { /* offline */ }
  try { localStorage.clear(); } catch { /* ignore */ }
  try { (await caches.keys()).forEach((k) => caches.delete(k)); } catch { /* ignore */ }
  try { (await navigator.serviceWorker?.getRegistrations())?.forEach((r) => r.unregister()); } catch { /* ignore */ }
}
export async function enablePush(): Promise<boolean> {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
    const perm = await Notification.requestPermission(); if (perm !== "granted") return false;
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
    const pad = "=".repeat((4 - (key.length % 4)) % 4);
    const raw = atob((key + pad).replace(/-/g, "+").replace(/_/g, "/"));
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: Uint8Array.from(raw, (c) => c.charCodeAt(0)) });
    const r = await fetch("/api/push/subscribe", { method: "POST", headers: deviceHeaders(), body: JSON.stringify({ subscription: sub.toJSON() }) });
    return r.ok;
  } catch { return false; }
}
export function track(name: string) { void writeOrQueue("/api/event", { name }); }
