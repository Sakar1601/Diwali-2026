"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { applySettings, isStandalone } from "@/lib/device";
import { PageBar } from "@/components/ui";

const Step = ({ n, t, d }: { n: number; t: string; d: string }) => (
  <div className="li" style={{ alignItems: "flex-start" }}><span className="num">{n}</span><div className="grow"><b>{t}</b><small>{d}</small></div></div>
);
export default function Install() {
  const router = useRouter();
  useEffect(() => { applySettings(); if (isStandalone()) router.replace("/setup"); }, [router]);
  return (
    <main className="screen narrow">
      <div className="pg fl">
        <PageBar back="/" tag="Step 1 of 2" />
        <div><h1 className="ttl">Keep this on your phone</h1><p className="lead">So it opens in one tap, like any other app.</p></div>
        <div className="cols2"><div className="sec"><div className="eb">iPhone</div>
        <div className="grp">
          <Step n={1} t="Tap the Share button" d="The square with an arrow, at the bottom of Safari." />
          <Step n={2} t="Tap Add to Home Screen" d="Scroll down in the list if you do not see it." />
          <Step n={3} t="Tap Add" d="Then open the app from your home screen." />
        </div>
        </div><div className="sec"><div className="eb">Android</div>
        <div className="grp"><Step n={1} t="Tap Install app" d="It appears at the bottom of the screen, or in the browser menu." /></div></div></div>
      </div>
      <div className="cta"><Link className="btn btn-p" href="/setup">I added it</Link><Link className="btn btn-g" href="/setup">Not now</Link></div>
    </main>
  );
}
