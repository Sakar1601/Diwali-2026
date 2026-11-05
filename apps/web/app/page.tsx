"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { applySettings, isOnboarded } from "@/lib/device";

export default function Welcome() {
  const router = useRouter();
  useEffect(() => { applySettings(); if (isOnboarded()) router.replace("/today"); }, [router]);
  return (
    <main className="screen" style={{ justifyContent: "space-between" }}>
      <div>
        <img src="/wordmark-indigo.png" alt="BAPS Swaminarayan Mandir, Phoenix" style={{ height: 40, width: "auto" }} />
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        <span className="step">BAPS Phoenix · Diwali 2026</span>
        <h1 style={{ fontSize: "2.2rem" }}>Experience Diwali together.</h1>
        <p>Saturday, November 14 · Tradition. Culture. Community.</p>
      </div>
      <a className="btn" href="/install">Get started</a>
    </main>
  );
}
