import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Togean Express — Speedboat Booking",
  description:
    "Fast, convenient, affordable speedboat transfers between Luwuk Airport and the Togean Islands.",
};

export const viewport: Viewport = {
  themeColor: "#01245c",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
