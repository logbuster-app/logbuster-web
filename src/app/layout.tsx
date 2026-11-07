import type { Metadata } from "next";
import { SiteHeader } from "@/shared/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "LogBuster",
  description: "Registre, avalie e descubra filmes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
