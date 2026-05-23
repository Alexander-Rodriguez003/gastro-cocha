import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";

export const metadata: Metadata = {
  title: "Gastro Cocha — Guía Gastronómica de Cochabamba",
  description: "Descubre los mejores platos típicos y restaurantes de las 16 provincias de Cochabamba, Bolivia. Silpancho, Pique Macho, Pichón de Cliza y más.",
  keywords: "gastronomía, Cochabamba, Bolivia, silpancho, pique macho, restaurantes, comida típica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Chatbot />
      </body>
    </html>
  );
}
