import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "ORVIDION — Intelligent Systems. Real Business Impact.",
  description:
    "ORVIDION baut strukturierte Systeme für Unternehmen: KI-Automatisierung, verbundene Abläufe, weniger Handarbeit. Struktur und messbarer Effekt statt Technologie von der Stange.",
  metadataBase: new URL("https://orvidion.de"),
  openGraph: {
    title: "ORVIDION — Intelligent Systems. Real Business Impact.",
    description:
      "Strukturierte Systeme für Unternehmen: KI-Automatisierung, verbundene Abläufe, weniger Handarbeit.",
    locale: "de_DE",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${spaceGrotesk.variable} antialiased`}>
      <body className="bg-ink text-white">{children}</body>
    </html>
  );
}
