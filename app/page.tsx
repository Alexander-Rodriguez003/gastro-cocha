import Link from "next/link";
import { getPlatosDestacados, getAllProvincias } from "@/lib/data";
import { Star, MapPin, ChevronRight, Utensils, TrendingUp } from "lucide-react";
import { PlatoCard } from "@/components/PlatoCard";
import { ProvinciaGrid } from "@/components/ProvinciaGrid";

export default async function Home() {
  const destacados = await getPlatosDestacados();
  const provincias = await getAllProvincias();

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero-gradient" style={{ padding: "4rem 1.5rem 3rem", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ maxWidth: 650 }}>
            <div className="badge badge-primary animate-fade-in" style={{ marginBottom: "1rem" }}>
              <Utensils size={14} style={{ marginRight: 4 }} /> 16 Provincias · +15 Platos Típicos
            </div>
            <h1
              className="animate-fade-in animate-fade-in-delay-1"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: "1rem",
              }}
            >
              Descubre la gastronomía de{" "}
              <span style={{ color: "var(--color-primary)" }}>Cochabamba</span>
            </h1>
            <p
              className="animate-fade-in animate-fade-in-delay-2"
              style={{
                fontSize: "1.1rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
                marginBottom: "1.5rem",
              }}
            >
              Desde el Silpancho en Cercado hasta el Pichón en Cliza. Encuentra los mejores platos,
              restaurantes y locales de carretera en todo el departamento.
            </p>
            <div className="animate-fade-in animate-fade-in-delay-3" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link href="/provincias" className="btn-primary">
                <MapPin size={18} /> Explorar Provincias
              </Link>
              <Link href="/ranking" className="btn-secondary">
                <TrendingUp size={18} style={{ marginRight: 4 }} /> Ver Ranking
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PLATOS DESTACADOS ===== */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem" }}>
              <Star size={22} color="var(--color-primary)" style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
              Platos Destacados
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              Lo mejor de la cocina cochabambina
            </p>
          </div>
          <Link href="/ranking" style={{ color: "var(--color-primary)", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            Ver todos <ChevronRight size={16} />
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {destacados.map((plato) => (
            <PlatoCard key={plato.id} plato={plato} />
          ))}
        </div>
      </section>

      {/* ===== PROVINCIAS ===== */}
      <section style={{ background: "var(--color-bg-card)", padding: "3rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem" }}>
              <MapPin size={22} color="var(--color-secondary)" style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
              Explora por Provincia
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              16 provincias, cada una con su propia identidad gastronómica
            </p>
          </div>
          <ProvinciaGrid provincias={provincias} />
        </div>
      </section>
    </>
  );
}
