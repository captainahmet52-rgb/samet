import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Depo Stok Yönetimi",
  description: "Temizlik şirketi depo ve stok takip paneli",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
