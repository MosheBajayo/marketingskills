import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/lib/content";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s | ${site.name}`,
  },
  description:
    "Bajayo Growth is a conversion & experimentation studio for Tech, DTC, and B2B2C brands — built on work for PepsiCo, SodaStream, Terminal X, Office Depot, Fox Group, and Lumen. Growth, engineered.",
  metadataBase: new URL("https://bajayogrowth.com"),
  keywords: [
    "CRO agency",
    "conversion rate optimization",
    "growth studio",
    "experimentation program",
    "product-led growth",
    "e-commerce CRO",
    "SaaS growth",
    "A/B testing",
  ],
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description:
      "A conversion & experimentation studio for Tech, DTC, and B2B2C brands. Growth, engineered.",
    type: "website",
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description:
      "A conversion & experimentation studio for Tech, DTC, and B2B2C brands. Growth, engineered.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${grotesk.variable} ${mono.variable}`}
    >
      <body className="font-sans bg-carbon-950 text-neutral-100 antialiased">
        <Navbar />
        <main className="min-h-screen pt-16 md:pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
