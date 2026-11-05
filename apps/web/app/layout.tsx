import type { Metadata, Viewport } from "next";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/noto-sans-devanagari/600.css";
import "@diwali/kit/tokens.css";
import Boot from "@/components/Boot";

export const metadata: Metadata = {
  title: "Light Beyond Lamps · BAPS Phoenix Diwali 2026",
  description: "Your guide to Diwali at BAPS Swaminarayan Mandir, Phoenix.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Diwali 2026", statusBarStyle: "default" },
};
export const viewport: Viewport = { themeColor: "#4353A2", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}<Boot /></body></html>);
}
