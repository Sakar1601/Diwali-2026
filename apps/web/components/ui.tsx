import Link from "next/link";

const P = {
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" /></>,
  pin: <><path d="M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" /></>,
  cam: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
  bell: <><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z" /><path d="M10 21h4" /></>,
  diya: <><path d="M12 3c3 4 4 7 0 11-4-4-3-7 0-11z" /><path d="M5 15h14c0 4-3 6-7 6s-7-2-7-6z" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>,
  star: <path d="M12 3l2.6 5.6 6 .7-4.4 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.4 9.3l6-.7z" />,
};
export const Icon = ({ n }: { n: keyof typeof P }) => <svg viewBox="0 0 24 24" aria-hidden>{P[n]}</svg>;

export const Logo = ({ size = 40 }: { size?: number }) => (
  <span style={{ display: "inline-flex", flex: "none", width: size, height: size, borderRadius: size / 4, background: "#fff", alignItems: "center", justifyContent: "center", padding: size / 8, border: "1px solid rgba(67,83,162,.16)" }}>
    <img src="/baps-logo.svg" alt="BAPS Swaminarayan Mandir, Phoenix logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
  </span>
);

export function Hdr({ strip }: { strip?: string | null }) {
  return (
    <div className="top">
      <div className="hdr inv">
        <div className="bar">
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <Logo />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>BAPS Swaminarayan Mandir</div>
              <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "#DAD6F0" }}>Phoenix, Arizona</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative", zIndex: 1 }}>
            <Link className="hb" href="/updates" aria-label="Updates"><Icon n="bell" /></Link>
            <Link className="av" href="/profile" aria-label="Profile"><Icon n="user" /></Link>
          </div>
        </div>
      </div>
      {strip && (
        <div className="strip" style={{ marginTop: -22, position: "relative", zIndex: 2 }}>
          <span className="df"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2c2.4 3 3 5.4 0 8.4-3-3-2.4-5.4 0-8.4z" /><path d="M3.5 13.5h17c0 4-3.6 7-8.5 7s-8.5-3-8.5-7z" /></svg></span>
          <b>LIVE</b><div className="track"><span>{strip}</span></div>
          <Link className="more" href="/updates">All ›</Link>
        </div>
      )}
    </div>
  );
}

export const PageBar = ({ back, tag }: { back: string; tag: string }) => (
  <div className="bar">
    <Link className="back" href={back} aria-label="Back">‹</Link>
    <span className="tag">{tag}</span>
    <Logo size={36} />
  </div>
);

const TABS: [string, string, keyof typeof P][] = [["/today", "Today", "sun"], ["/map", "Map", "pin"], ["/moments", "Moments", "cam"], ["/updates", "Updates", "bell"], ["/booths", "Booths", "diya"]];
export function Dock({ active }: { active: string }) {
  return (
    <nav className="dock" aria-label="Main">
      <div className="dockbrand"><Logo size={44} /><div><b>BAPS Phoenix</b><small>Light Beyond Lamps</small></div></div>
      {TABS.map(([href, label, ic]) => (
        <Link key={href} href={href} className={`${href === active ? "on" : ""} ${ic === "cam" ? "cam" : ""}`} aria-current={href === active ? "page" : undefined}>
          {ic === "cam" ? <i><Icon n={ic} /></i> : <Icon n={ic} />}{label}
        </Link>
      ))}
    </nav>
  );
}

export const Toggle = ({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) => (
  <button type="button" role="switch" aria-checked={on} aria-label={label} className="sw" onClick={() => onChange(!on)} />
);
