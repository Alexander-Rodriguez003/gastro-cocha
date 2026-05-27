import Link from "next/link";
import { getPlatosDestacados, getAllProvincias } from "@/lib/data";
import { Star, MapPin, ChevronRight, Utensils, TrendingUp, Navigation } from "lucide-react";
import { FeaturedPlatos } from "@/components/home/FeaturedPlatos";
import { ProvinciaGrid } from "@/components/ProvinciaGrid";
import { MapWrapper } from "@/components/MapWrapper";

export default async function Home() {
  const destacados = await getPlatosDestacados();
  const provincias = await getAllProvincias();

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero-gradient" style={{ padding: "4rem 1.5rem 3.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ maxWidth: 650 }}>
            <div className="badge badge-primary animate-fade-in" style={{ marginBottom: "1rem" }}>
              <Utensils size={14} style={{ marginRight: 4 }} /> 16 Provincias · Gastronomía Tradicional
            </div>
            <h1
              className="animate-fade-in animate-fade-in-delay-1"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.25rem, 6vw, 3.5rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: "1rem",
              }}
            >
              Descubre los sabores de{" "}
              <span style={{ color: "var(--color-primary)" }}>Cochabamba</span>
            </h1>
            <p
              className="animate-fade-in animate-fade-in-delay-2"
              style={{
                fontSize: "1.15rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
                marginBottom: "2rem",
              }}
            >
              Explora las delicias de las 16 provincias. Encuentra silpanchos baratos en Cercado, 
              pichones jugosos en Cliza o truchas frescas en el Chapare con nuestro mapa inteligente.
            </p>
            <div className="animate-fade-in animate-fade-in-delay-3" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <a href="#mapa-gastronomico" className="btn-primary">
                <MapPin size={18} /> Explorar Mapa
              </a>
              <Link href="/ranking" className="btn-secondary">
                <TrendingUp size={18} style={{ marginRight: 4 }} /> Ver Ranking
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAPA GASTRONÓMICO INTERACTIVO ===== */}
      <section id="mapa-gastronomico" style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 1.5rem 2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div className="badge badge-secondary" style={{ marginBottom: "0.5rem" }}>
            <Navigation size={12} style={{ marginRight: 4 }} /> Geolocalización Activa
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.75rem" }}>
            Mapa Gastronómico e Inteligente
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", marginTop: 4 }}>
            Usa tu GPS para descubrir platos típicos y restaurantes de carretera más cercanos a ti.
          </p>
        </div>
        <MapWrapper />
      </section>

      {/* ===== PLATOS DESTACADOS ===== */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem 3rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem" }}>
              <Star size={22} color="var(--color-primary)" style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
              Platos Destacados
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              Los favoritos de los viajeros y locales
            </p>
          </div>
          <Link href="/ranking" style={{ color: "var(--color-primary)", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            Ver todos los platos <ChevronRight size={16} />
          </Link>
        </div>

        <FeaturedPlatos initialPlatos={destacados} />
      </section>

      {/* ===== PROVINCIAS ===== */}
      <section style={{ background: "var(--color-bg-card)", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem" }}>
              <MapPin size={22} color="var(--color-secondary)" style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
              Explora por Provincia
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              Haz clic en cualquiera de las 16 provincias para conocer su cultura culinaria
            </p>
          </div>
          <ProvinciaGrid provincias={provincias} />
        </div>
      </section>
    </>
  );
}
