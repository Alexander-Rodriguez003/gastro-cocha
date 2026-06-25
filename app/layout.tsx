import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";

export const metadata: Metadata = {
  title: "GastroCocha — Guía Gastronómica de Cochabamba",
  description:
    "Descubre los mejores platos típicos y restaurantes de las 16 provincias de Cochabamba, Bolivia. Silpancho, Pique Macho, Pichón de Cliza y más.",
  keywords:
    "gastronomía, Cochabamba, Bolivia, silpancho, pique macho, restaurantes, comida típica",
  openGraph: {
    title: "GastroCocha — Guía Gastronómica de Cochabamba",
    description:
      "Platos típicos, restaurantes y cultura gastronómica de las 16 provincias de Cochabamba.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Preconnect for Google Fonts (loaded in globals.css via @import) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Chatbot />
      </body>
    </html>
  );
}
