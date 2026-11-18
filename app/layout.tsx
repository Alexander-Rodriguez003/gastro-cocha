import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://guiagastronomicacohala.dpdns.org";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GastroCocha — Guía Gastronómica de Cochabamba",
    template: "%s | GastroCocha",
  },
  description:
    "Descubre los mejores platos típicos y restaurantes de las 16 provincias de Cochabamba, Bolivia. Silpancho, Pique Macho, Pichón de Cliza y más.",
  keywords: [
    "gastronomía",
    "Cochabamba",
    "Bolivia",
    "silpancho",
    "pique macho",
    "restaurantes",
    "comida típica",
  ],
  openGraph: {
    title: "GastroCocha — Guía Gastronómica de Cochabamba",
    description:
      "Platos típicos, restaurantes y cultura gastronómica de las 16 provincias de Cochabamba.",
    url: SITE_URL,
    siteName: "GastroCocha",
    locale: "es_BO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Saltar al contenido
        </a>
        <Navbar />
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Chatbot />
      </body>
    </html>
  );
}
