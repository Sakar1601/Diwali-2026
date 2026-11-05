"use client";
import { useEffect } from "react";
import { flushOutbox } from "@/lib/device";

// Runs once per page load for every visitor: installs the offline cache and sends any saved writes.
export default function Boot() {
  useEffect(() => {
    const flush = () => { if (navigator.onLine) void flushOutbox(); };
    if ("serviceWorker" in navigator && location.protocol === "https:" || location.hostname === "localhost") {
      navigator.serviceWorker?.register("/sw.js").catch(() => {});
    }
    flush();
    window.addEventListener("online", flush);
    const vis = () => { if (document.visibilityState === "visible") flush(); };
    document.addEventListener("visibilitychange", vis);
    const t = setInterval(flush, 30_000);
    return () => { window.removeEventListener("online", flush); document.removeEventListener("visibilitychange", vis); clearInterval(t); };
  }, []);
  return null;
}
