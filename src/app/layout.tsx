import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antrian PST — Pelayanan Statistik Terpadu",
  description: "Sistem antrian digital untuk Pelayanan Statistik Terpadu (PST)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="bg-slate-50 min-h-screen antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
