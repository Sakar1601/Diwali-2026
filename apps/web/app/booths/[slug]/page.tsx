import Link from "next/link";
import { notFound } from "next/navigation";
import { BOOTHS } from "@/lib/booths";
import LightLamp from "@/components/LightLamp";

export function generateStaticParams() { return BOOTHS.map((b) => ({ slug: b.slug })); }
export default async function Booth({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = BOOTHS.find((x) => x.slug === slug); if (!b) notFound();
  return (
    <main className="screen">
      <Link className="back" href="/booths">‹ All booths</Link>
      <span className="step">{b.sub}</span><h1>{b.name}</h1>
      <p style={{ color: "var(--tx)" }}>{b.blurb}</p>
      <LightLamp slug={b.slug} />
    </main>
  );
}
