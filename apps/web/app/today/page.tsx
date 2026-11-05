"use client";
import { useEffect } from "react";
import { applySettings, ensureDevice } from "@/lib/device";

export default function Today() {
  useEffect(() => { applySettings(); ensureDevice(); }, []);
  return (
    <main className="screen">
      <header>
        <span className="step">BAPS Swaminarayan Mandir · Phoenix</span>
        <h1>शुभ दीपावली</h1>
        <p>Saturday, Nov 14 · Welcome to the mandir</p>
      </header>
      <section className="card">
        <span className="step">Coming next</span>
        <h2>Schedule, map and updates</h2>
        <p>The live schedule and navigation are being connected to the event data.</p>
      </section>
    </main>
  );
}
