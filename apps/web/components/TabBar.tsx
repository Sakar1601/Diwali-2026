import Link from "next/link";
const tabs = [["/today", "Today"], ["/map", "Map"], ["/moments", "Moments"], ["/updates", "Updates"], ["/booths", "Booths"]] as const;
export default function TabBar({ active }: { active: string }) {
  return (
    <nav aria-label="Main" style={{ position: "sticky", bottom: 0, background: "var(--s1)", borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "repeat(5,1fr)", margin: "0 -20px -32px", padding: "4px 0 env(safe-area-inset-bottom)" }}>
      {tabs.map(([href, label]) => (
        <Link key={href} href={href} aria-current={active === href ? "page" : undefined}
          style={{ textAlign: "center", padding: "14px 2px", minHeight: 48, fontSize: ".78rem", textDecoration: "none", fontWeight: active === href ? 700 : 500, color: active === href ? "var(--nv)" : "var(--mu)" }}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
