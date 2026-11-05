import { notFound } from "next/navigation";
import { BOOTHS } from "@/lib/booths";
import { PageBar } from "@/components/ui";
import LightLamp from "@/components/LightLamp";

export function generateStaticParams() { return BOOTHS.map((b) => ({ slug: b.slug })); }
export default async function Booth({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = BOOTHS.findIndex((x) => x.slug === slug); if (i < 0) notFound();
  const b = BOOTHS[i];
  return (
    <main className="screen narrow">
      <div className="pg fl">
        <PageBar back="/booths" tag={`Booth ${i + 1} of ${BOOTHS.length}`} />
        <div><div className="eb">{b.name}</div><h1 className="ttl" style={{ marginTop: 6 }}>{b.title}</h1><p className="lead">{b.lead}</p></div>
        <div className="card ctr" style={{ padding: 24 }}><div className="eb">Booth activity</div><p style={{ marginTop: 8 }}>The interactive activity for this booth is coming soon. You can still light your lamp.</p></div>
      </div>
      <div className="cta"><LightLamp slug={b.slug} /></div>
    </main>
  );
}
