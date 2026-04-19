import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Check Bag B2B",
  description: "Check Bag B2B Toptan Satış Sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
