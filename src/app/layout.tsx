import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Togean Express — Speedboat Booking",
  description: "Book your speedboat transfer across the Togean Islands.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
