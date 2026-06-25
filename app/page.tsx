import Link from "next/link";
import Image from "next/image";
import { getPlatosDestacados, getAllProvincias } from "@/lib/data";
import { MapPin, ChevronRight, TrendingUp, Navigation } from "lucide-react";
import { FeaturedPlatos } from "@/components/home/FeaturedPlatos";
import { ProvinciaGrid } from "@/components/ProvinciaGrid";
import { MapWrapper } from "@/components/MapWrapper";

export const dynamic = "force-dynamic";

// NOTE: This is a Server Component — NO event handlers allowed here.

export default async function Home() {
  const destacados = await getPlatosDestacados();
  const provincias = await getAllProvincias();

  return (
    <>
      {/* ═══════════════════════════════════════════
          HERO — full-width restaurant photo
          ═══════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          width: "100%",
          height: "clamp(320px, 56vw, 620px)",
          overflow: "hidden",
          background: "#1A1714",
        }}
      >
        <Image
          src="/hero-restaurant.jpg"
          alt="Interior de restaurante tradicional boliviano"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center", opacity: 0.88 }}
          sizes="100vw"
        />
        {/* Subtle bottom gradient for text transition */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(26,23,20,0) 50%, rgba(247,244,238,0.15) 100%)",
          }}
        />
        {/* Top-right reservation CTA — like Beddia's "Make a Reservation" */}
        <div
          style={{
            position: "absolute",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Link
            href="#mapa-gastronomico"
            className="hero-cta-pill"
          >
            <Navigation size={13} />
            Explorar el mapa
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          INTRO — Headline + badge + description
          (mirrors: "Pizza, Wine, and Everything Fine.")
          ═══════════════════════════════════════════ */}
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "3.5rem 2rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
        }}
        className="intro-grid"
      >
        {/* Left: headline + badge */}
        <div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 800,
              fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
              lineHeight: 1.08,
              color: "var(--color-ink)",
              letterSpacing: "-0.02em",
              marginBottom: "1.25rem",
            }}
          >
            Silpancho, Chicha{" "}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                verticalAlign: "middle",
                background: "var(--color-forest)",
                color: "var(--color-forest-text)",
                padding: "0.2rem 0.7rem",
                borderRadius: "var(--radius-pill)",
                fontSize: "0.55em",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily: "var(--font-body)",
                marginLeft: "0.3em",
                position: "relative",
                top: "-0.1em",
              }}
            >
              16 provincias
            </span>
            <br />
            y Todo lo Bueno.
          </h1>
        </div>

        {/* Right: description + CTAs */}
        <div>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--color-muted)",
              lineHeight: 1.75,
              marginBottom: "2rem",
              maxWidth: 420,
            }}
          >
            Servimos historia, sabor y cultura en cada plato. En el corazón de Cochabamba.
            Desde el silpancho de Cercado hasta las truchas del Chapare — los visitantes
            son bienvenidos. El mapa interactivo funciona con tu ubicación GPS.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="#mapa-gastronomico" className="btn-primary">
              <MapPin size={15} />
              Explorar Mapa
            </Link>
            <Link href="/ranking" className="btn-secondary">
              <TrendingUp size={15} />
              Ver Ranking
            </Link>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ═══════════════════════════════════════════
          EL MAPA GASTRONÓMICO — split section
          (mirrors: "The Hoagie Room")
          ═══════════════════════════════════════════ */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: 480,
        }}
        className="split-section"
      >
        {/* Left: editorial image */}
        <div
          style={{
            position: "relative",
            minHeight: 400,
            overflow: "hidden",
          }}
        >
          <Image
            src="/food-spread.jpg"
            alt="Mesa de comida boliviana tradicional"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            sizes="50vw"
          />
        </div>

        {/* Right: text content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "4rem 3.5rem",
            background: "var(--color-cream)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 900,
              fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)",
              lineHeight: 1,
              color: "var(--color-ink)",
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}
          >
            EL MAPA<br />GASTRONÓMICO
          </p>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--color-muted)",
              lineHeight: 1.75,
              marginBottom: "2rem",
              maxWidth: 380,
            }}
          >
            Un mapa interactivo en tiempo real. Geolocalización activa para encontrar
            restaurantes y platos típicos cerca de ti. Filtra por provincia, precio
            o tipo de plato. Funciona en las 16 provincias de Cochabamba.
          </p>
          <div>
            <Link href="#mapa-gastronomico" className="btn-primary">
              Ver mapa
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ═══════════════════════════════════════════
          TWO-COL CARDS — Nuestros Platos + Para Grupos
          (mirrors: "Our Menu" | "Pizza Party")
          ═══════════════════════════════════════════ */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderBottom: "1px solid var(--color-border)",
        }}
        className="cards-grid"
      >
        {/* Card 1 — Nuestros Platos */}
        <div style={{ borderRight: "1px solid var(--color-border)" }}>
          {/* Image */}
          <div className="card-img-wrap" style={{ position: "relative", width: "100%", aspectRatio: "4/3" }}>
            <Image
              src="/dining-group.jpg"
              alt="Personas compartiendo comida tradicional boliviana"
              fill
              style={{ objectFit: "cover", objectPosition: "center" }}
              sizes="50vw"
            />
          </div>
          {/* Text */}
          <div style={{ padding: "2rem 2.5rem 2.5rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 700,
                fontSize: "1.5rem",
                color: "var(--color-ink)",
                marginBottom: "0.75rem",
                letterSpacing: "-0.01em",
              }}
            >
              Nuestros Platos
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-muted)",
                lineHeight: 1.7,
                marginBottom: "1.25rem",
                maxWidth: 380,
              }}
            >
              Platos típicos de las 16 provincias: silpancho, pique macho, pichón de Cliza,
              trucha del Chapare, sopa de maní y más. Todos con su historia, ingredientes
              y los mejores lugares donde encontrarlos.
            </p>
            <Link href="/ranking" className="section-link">
              Ver más
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Card 2 — Para Grupos */}
        <div>
          <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", overflow: "hidden", background: "var(--color-amber-light)" }}>
            {/* Decorative card (no image) — editorial collage style */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "0.5rem",
                background: "linear-gradient(135deg, #F3E8D8 0%, #EDD9BE 100%)",
              }}
            >
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="39" stroke="#C8702A" strokeWidth="1.5" strokeDasharray="4 4"/>
                <path d="M26 40 C26 32.268 32.268 26 40 26 C47.732 26 54 32.268 54 40" stroke="#1A1714" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="30" cy="38" r="3" fill="#C8702A"/>
                <circle cx="40" cy="34" r="3" fill="#2A5C3F"/>
                <circle cx="50" cy="38" r="3" fill="#C8702A"/>
                <path d="M24 52 C28 46 36 42 40 42 C44 42 52 46 56 52" stroke="#1A1714" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 700, color: "var(--color-ink)", textAlign: "center", maxWidth: 180, lineHeight: 1.2 }}>
                Gastronomía en<br />comunidad
              </p>
            </div>
          </div>
          {/* Text */}
          <div style={{ padding: "2rem 2.5rem 2.5rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 700,
                fontSize: "1.5rem",
                color: "var(--color-ink)",
                marginBottom: "0.75rem",
                letterSpacing: "-0.01em",
              }}
            >
              Registra tu Negocio
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-muted)",
                lineHeight: 1.7,
                marginBottom: "1.25rem",
                maxWidth: 380,
              }}
            >
              ¿Tienes un restaurante, pensión o puesto de comida en Cochabamba?
              Regístralo en nuestra plataforma y llega a más viajeros y locales que
              buscan sabores auténticos de la región.
            </p>
            <Link href="/registrar-negocio" className="section-link">
              Registrar
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MAPA INTERACTIVO
          ═══════════════════════════════════════════ */}
      <section id="mapa-gastronomico" style={{ maxWidth: 1280, margin: "0 auto", padding: "4rem 2rem" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="badge badge-ink" style={{ marginBottom: "0.75rem" }}>
              <Navigation size={10} />
              Geolocalización activa
            </span>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 700,
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                color: "var(--color-ink)",
                letterSpacing: "-0.01em",
              }}
            >
              Mapa Gastronómico
            </h2>
            <p style={{ color: "var(--color-muted)", fontSize: "0.875rem", marginTop: "0.4rem" }}>
              Usa tu GPS para descubrir platos y restaurantes más cercanos a ti.
            </p>
          </div>
          <Link href="/negocios" className="section-link">
            Ver todos los negocios <ChevronRight size={13} />
          </Link>
        </div>
        <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--color-border)" }}>
          <MapWrapper />
        </div>
      </section>

      <hr className="divider" />

      {/* ═══════════════════════════════════════════
          PLATOS DESTACADOS — horizontal strip
          (mirrors: pizza strip row)
          ═══════════════════════════════════════════ */}
      <section style={{ padding: "4rem 0", background: "var(--color-cream)", overflow: "hidden" }}>
        {/* Section header */}
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 700,
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                color: "var(--color-ink)",
                letterSpacing: "-0.01em",
              }}
            >
              Platos Destacados
            </h2>
            <p style={{ color: "var(--color-muted)", fontSize: "0.875rem", marginTop: "0.4rem" }}>
              Los favoritos de viajeros y locales — calificados por la comunidad
            </p>
          </div>
          <Link href="/ranking" className="section-link">
            Ver ranking completo <ChevronRight size={13} />
          </Link>
        </div>

        {/* Grid */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
          <FeaturedPlatos initialPlatos={destacados} />
        </div>
      </section>

      <hr className="divider" />

      {/* ═══════════════════════════════════════════
          PROVINCIAS
          ═══════════════════════════════════════════ */}
      <section style={{ padding: "4rem 0 5rem", background: "var(--color-cream)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: "2.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 700,
                  fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                  color: "var(--color-ink)",
                  letterSpacing: "-0.01em",
                }}
              >
                Provincias
              </h2>
              <p style={{ color: "var(--color-muted)", fontSize: "0.875rem", marginTop: "0.4rem" }}>
                Explora las 16 provincias de Cochabamba y su cultura culinaria
              </p>
            </div>
            <Link href="/provincias" className="section-link">
              Ver las 16 provincias <ChevronRight size={13} />
            </Link>
          </div>
          <ProvinciaGrid provincias={provincias} limit={8} />
        </div>
      </section>

      <style>{`
        .intro-grid {
          grid-template-columns: 1fr 1fr;
        }
        .split-section {
          grid-template-columns: 1fr 1fr;
        }
        .cards-grid {
          grid-template-columns: 1fr 1fr;
        }
        .card-img:hover {
          transform: scale(1.03);
        }
        @media (max-width: 768px) {
          .intro-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
            padding: 2.5rem 1.25rem !important;
          }
          .split-section {
            grid-template-columns: 1fr !important;
          }
          .cards-grid {
            grid-template-columns: 1fr !important;
          }
          .cards-grid > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid var(--color-border);
          }
        }
      `}</style>
    </>
  );
}
