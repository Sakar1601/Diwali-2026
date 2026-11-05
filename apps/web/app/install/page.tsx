"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { applySettings, isStandalone } from "@/lib/device";

const Step = ({ n, t, d }: { n: number; t: string; d: string }) => (
  <div className="row" style={{ alignItems: "flex-start" }}>
    <b style={{ color: "var(--sf)" }}>{n}</b>
    <div style={{ flex: 1 }}><b>{t}</b><p>{d}</p></div>
  </div>
);

export default function Install() {
  const router = useRouter();
  useEffect(() => { applySettings(); if (isStandalone()) router.replace("/setup"); }, [router]);
  return (
    <main className="screen">
      <span className="step">Step 1 of 2</span>
      <h1>Keep this on your phone</h1>
      <p>So it opens in one tap, like any other app.</p>
      <section className="card" aria-label="iPhone">
        <h2>iPhone</h2>
        <Step n={1} t="Tap the Share button" d="The square with an arrow, at the bottom of Safari." />
        <Step n={2} t="Tap Add to Home Screen" d="Scroll down in the list if you do not see it." />
        <Step n={3} t="Tap Add" d="Then open the app from your home screen." />
      </section>
      <section className="card" aria-label="Android">
        <h2>Android</h2>
        <Step n={1} t="Tap Install app" d="It appears at the bottom of the screen, or in the browser menu." />
      </section>
      <a className="btn" href="/setup">I added it</a>
      <a className="btn ghost" href="/setup">Not now</a>
    </main>
  );
}
