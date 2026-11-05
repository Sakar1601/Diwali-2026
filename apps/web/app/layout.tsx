import type { Metadata, Viewport } from "next";
import "@diwali/kit/tokens.css";

export const metadata: Metadata = {
  title: "Light Beyond Lamps · BAPS Phoenix Diwali 2026",
  description: "Your guide to Diwali at BAPS Swaminarayan Mandir, Phoenix.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Diwali 2026", statusBarStyle: "default" },
};
export const viewport: Viewport = { themeColor: "#4353A2", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
