import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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
    "Elite Growth & CRO consulting for Tech/SaaS and D2C e-commerce brands. Turn expensive traffic into predictable revenue with rigorous experimentation.",
  metadataBase: new URL("https://jordanvale.com"),
  keywords: [
    "CRO consultant",
    "conversion rate optimization",
    "growth consultant",
    "product-led growth",
    "e-commerce CRO",
    "SaaS growth",
    "A/B testing",
  ],
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description:
      "Turn expensive traffic into predictable revenue. Growth & CRO for Tech and D2C.",
    type: "website",
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description:
      "Turn expensive traffic into predictable revenue. Growth & CRO for Tech and D2C.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans bg-ink-950 text-slate-100 antialiased">
        <Navbar />
        <main className="min-h-screen pt-16 md:pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
