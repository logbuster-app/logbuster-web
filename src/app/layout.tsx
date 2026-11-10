import type { Metadata } from "next";
import { Archivo, Source_Serif_4 } from "next/font/google";
import { SiteHeader } from "@/shared/components/SiteHeader";
import "./globals.css";

// Letra condensada pesada (eixo de largura) para títulos; Archivo normal para a interface.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

// Serifa de leitura para sinopse e análises longas.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LogBuster",
  description: "Registre, avalie e descubra filmes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
