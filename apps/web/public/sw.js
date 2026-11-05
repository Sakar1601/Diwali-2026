/* Light Beyond Lamps service worker: the app opens from the phone's own copy, even with no signal. */
const V = "v3";
const STATIC = `lbl-static-${V}`, PAGES = `lbl-pages-${V}`;
const SLUGS = ["bhasha", "bhusha", "bhojan", "arts", "festivals", "spirituality"];
const ROUTES = ["/", "/today", "/map", "/moments", "/booths", "/updates", "/annakut", "/profile", "/help", "/install", "/setup", ...SLUGS.map((s) => "/booths/" + s)];
const ASSETS = ["/baps-logo.svg", "/toran-tile.webp", "/toran.webp", "/bokeh.webp", "/diya-bg.webp", "/wordmark-white.webp", "/wordmark-indigo.webp", "/diyas.webp", "/manifest.webmanifest"];
const FRESH_FIRST = ["/today", "/updates"]; // show the newest if it arrives within 2.5s, else the saved copy
const SKIP = /^\/(api|staff|admin|tv|go)(\/|$)|^\/sw\.js$/;

async function put(cache, url, res) { if (res && res.ok) await cache.put(url, res.clone()); return res; }

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil((async () => {
    const pages = await caches.open(PAGES), stat = await caches.open(STATIC);
    const found = new Set();
    await Promise.allSettled(ROUTES.map(async (r) => {
      const res = await fetch(r, { credentials: "same-origin" });
      if (!res.ok) return;
      const html = await res.clone().text();
      for (const m of html.matchAll(/\/_next\/static\/[^"'\\\s)<>]+/g)) found.add(m[0]);
      await pages.put(r, res);
    }));
    await Promise.allSettled(ASSETS.map((a) => stat.add(a)));
    const css = [];
    await Promise.allSettled([...found].map(async (u) => {
      const res = await fetch(u); if (!res.ok) return;
      await stat.put(u, res.clone()); if (u.endsWith(".css")) css.push(res);
    }));
    await Promise.allSettled(css.map(async (res) => {
      const t = await res.clone().text();
      for (const m of t.matchAll(/url\((\/_next\/static\/media\/[^)"']+)\)/g)) { try { const f = await fetch(m[1]); await put(stat, m[1], f); } catch (_) {} }
    }));
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("lbl-") && k !== STATIC && k !== PAGES) await caches.delete(k);
    await self.clients.claim();
  })());
});

const isStatic = (u) => u.pathname.startsWith("/_next/static/") || /\.(webp|svg|png|jpg|woff2?|css|js)$/.test(u.pathname);

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.origin !== location.origin || SKIP.test(u.pathname)) return;

  if (isStatic(u)) { // cache first: these files never change under the same name
    e.respondWith((async () => {
      const c = await caches.open(STATIC), hit = await c.match(req, { ignoreVary: true });
      if (hit) return hit;
      try { return await put(c, req, await fetch(req)); } catch (_) { return Response.error(); }
    })());
    return;
  }

  // Pages and their data: saved copy first (instant on a bad connection), refreshed in the background.
  e.respondWith((async () => {
    const c = await caches.open(PAGES), hit = await c.match(req, { ignoreVary: true });
    const net = fetch(req).then((r) => put(c, req, r)).catch(() => null);
    if (hit && !FRESH_FIRST.includes(u.pathname)) { e.waitUntil(net); return hit; }
    if (hit) { // fresh-first: wait up to 2.5s for the network
      const winner = await Promise.race([net, new Promise((r) => setTimeout(() => r(null), 2500))]);
      e.waitUntil(net); return winner || hit;
    }
    const r = await net;
    if (r) return r;
    if (req.mode === "navigate") return (await c.match("/today", { ignoreVary: true })) || (await c.match("/", { ignoreVary: true })) || Response.error();
    return Response.error();
  })());
});

self.addEventListener("push", (e) => {
  let d = { title: "Light Beyond Lamps", body: "You have a new update.", url: "/updates" };
  try { d = { ...d, ...e.data.json() }; } catch (_) {}
  e.waitUntil(self.registration.showNotification(d.title, { body: d.body, icon: "/baps-logo.svg", data: { url: d.url } }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/updates";
  e.waitUntil(self.clients.matchAll({ type: "window" }).then((cs) => { for (const c of cs) { if ("focus" in c) { c.navigate(url); return c.focus(); } } return self.clients.openWindow(url); }));
});
