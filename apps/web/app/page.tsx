"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { applySettings, isOnboarded } from "@/lib/device";
import { Logo } from "@/components/ui";

export default function Welcome() {
  const router = useRouter();
  useEffect(() => { applySettings(); if (isOnboarded()) router.replace("/today"); }, [router]);
  return (
    <main className="screen wel">
      <div className="wtop inv">
        <img className="toran" src="/toran.png" alt="" />
        <div className="brand" style={{ marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo size={44} />
            <div><div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>BAPS Swaminarayan Mandir</div><div className="sm mu" style={{ fontSize: 13 }}>Phoenix, Arizona</div></div>
          </div>
        </div>
        <Link className="lang" href="/help" style={{ alignSelf: "flex-start", background: "rgba(255,255,255,.12)", position: "relative", zIndex: 1 }}>Language: English ▾</Link>
        <div className="hero" style={{ marginTop: "auto", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".2em" }}>BAPS PHOENIX · DIWALI 2026</div>
          <img src="/wordmark-white.png" alt="Light Beyond Lamps" style={{ width: 250, maxWidth: "80%", display: "block", margin: "12px auto 0" }} />
          <img src="/diyas.png" alt="" style={{ width: 88, display: "block", margin: "12px auto 0" }} />
        </div>
      </div>
      <div className="wbg">
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#4353A2", lineHeight: 1.25 }}>Experience Diwali together.</div>
          <div className="mu" style={{ marginTop: 6, fontSize: 15 }}>Saturday, November 14 · Tradition. Culture. Community.</div>
        </div>
        <Link className="btn btn-p" href="/install">Get started</Link>
      </div>
    </main>
  );
}
