import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-mulish",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Lumen Device | Lumen",
  description:
    "Everything you need to optimize your health in the palm of your hand.",
  metadataBase: new URL("https://www.lumen.me"),
  openGraph: {
    title: "The Lumen Device | Lumen",
    description:
      "Everything you need to optimize your health in the palm of your hand.",
    url: "https://www.lumen.me/shop",
    siteName: "Lumen",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={mulish.variable}>
      <body className="font-sans bg-lumen-night text-white">{children}</body>
    </html>
  );
}
