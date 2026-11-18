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
        <div
          style={{
            position: "absolute",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
          }}
        >
          <Link
            href="#mapa-gastronomico"
            className="hero-cta-pill"
            style={{ whiteSpace: "nowrap" }}
          >
            <Navigation size={13} />
            Explorar el mapa
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          INTRO — Headline + badge + description
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
        {/* Left: eyebrow + headline */}
        <div>
          <span
            className="badge badge-forest"
            style={{ marginBottom: "1rem" }}
          >
            16 provincias de Cochabamba
          </span>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 800,
              fontSize: "clamp(2rem, 4.4vw, 3.25rem)",
              lineHeight: 1.08,
              color: "var(--color-ink)",
              letterSpacing: "-0.02em",
            }}
          >
            Silpancho, Chicha{" "}
            <span style={{ fontStyle: "italic", color: "var(--color-amber)" }}>
              y Todo lo Bueno.
            </span>
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
          className="split-section-body"
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
          ASYMMETRICAL EDITORIAL SPREAD
          Nuestros Platos + Cocina en Comunidad (/kitchen-host.jpg)
          ═══════════════════════════════════════════ */}
      <section
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-cream)",
        }}
      >
        <div
          className="editorial-spread"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.32fr 1fr",
            alignItems: "stretch",
          }}
        >
          {/* Left wide column — Foto principal + tira de platos + texto */}
          <div
            className="editorial-col-left"
            style={{
              borderRight: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="card-img-wrap" style={{ position: "relative", width: "100%", aspectRatio: "16/10" }}>
              <Image
                src="/dining-group.jpg"
                alt="Personas compartiendo comida tradicional boliviana"
                fill
                style={{ objectFit: "cover", objectPosition: "center" }}
                sizes="(max-width: 768px) 100vw, 57vw"
              />
            </div>

            {/* Secondary asymmetric dish strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1px",
                background: "var(--color-border)",
                borderTop: "1px solid var(--color-border)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {[
                { src: "/images/silpancho.png", alt: "Silpancho cochabambino", href: "/plato/silpancho", label: "Silpancho" },
                { src: "/images/pichon-cliza.png", alt: "Pichón de Cliza", href: "/plato/pichon-cliza", label: "Pichón de Cliza" },
                { src: "/images/chorizo-tarateno.png", alt: "Chorizo Tarateño", href: "/plato/chorizo-tarateno", label: "Chorizo Tarateño" },
              ].map((dish) => (
                <Link
                  key={dish.href}
                  href={dish.href}
                  style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", display: "block", background: "var(--color-amber-light)" }}
                >
                  <Image
                    src={dish.src}
                    alt={dish.alt}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 33vw, 20vw"
                  />
                  <span
                    style={{
                      position: "absolute",
                      left: 8,
                      bottom: 8,
                      background: "rgba(26, 23, 20, 0.78)",
                      color: "#F7F4EE",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "var(--radius-pill)",
                    }}
                  >
                    {dish.label}
                  </span>
                </Link>
              ))}
            </div>

            <div className="editorial-copy" style={{ padding: "2.25rem 2.5rem 2.75rem" }}>
              <span className="badge badge-primary" style={{ marginBottom: "0.85rem" }}>
                Recetas y tradición
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 800,
                  fontSize: "clamp(1.5rem, 2.5vw, 1.9rem)",
                  color: "var(--color-ink)",
                  marginBottom: "0.75rem",
                  letterSpacing: "-0.015em",
                }}
              >
                Nuestros Platos
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--color-muted)",
                  lineHeight: 1.7,
                  marginBottom: "1.25rem",
                  maxWidth: 460,
                }}
              >
                Platos típicos de las 16 provincias: silpancho, pique macho, pichón de Cliza,
                trucha del Chapare, fricasé y más. Todos con su historia, ingredientes y los
                locales reales donde probarlos.
              </p>
              <Link href="/ranking" className="section-link">
                Explorar ranking y platos
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>

          {/* Right offset column — Texto arriba + fotografía documental abajo */}
          <div
            className="editorial-col-right"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div className="editorial-copy" style={{ padding: "2.75rem 2.5rem 2.25rem" }}>
              <span className="badge badge-forest" style={{ marginBottom: "0.85rem" }}>
                Para cocineros y locales
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 800,
                  fontSize: "clamp(1.5rem, 2.5vw, 1.9rem)",
                  color: "var(--color-ink)",
                  marginBottom: "0.75rem",
                  letterSpacing: "-0.015em",
                  lineHeight: 1.12,
                }}
              >
                Registra tu Negocio
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--color-muted)",
                  lineHeight: 1.7,
                  marginBottom: "1.5rem",
                }}
              >
                ¿Tienes un restaurante, picantería o puesto tradicional en Cochabamba?
                Súmate sin costo: aparecerás en el mapa GPS, con tu menú, precios y
                recomendaciones del asistente.
              </p>
              <Link href="/registrar-negocio" className="btn-primary">
                Registrar mi negocio
                <ChevronRight size={15} />
              </Link>
            </div>

            <div style={{ marginTop: "auto" }}>
              <div
                className="card-img-wrap"
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4/3",
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                <Image
                  src="/kitchen-host.jpg"
                  alt="Cocinera cochabambina sirviendo platos tradicionales en picantería"
                  fill
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  sizes="(max-width: 768px) 100vw, 43vw"
                />
              </div>
              <div
                style={{
                  padding: "0.95rem 1.75rem",
                  borderTop: "1px solid var(--color-border)",
                  background: "var(--color-bg-card)",
                  fontSize: "0.78rem",
                  color: "var(--color-muted)",
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <span>Mapa GPS + Menú propio</span>
                <strong style={{ color: "var(--color-forest)" }}>Registro gratuito</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MAPA INTERACTIVO
          ═══════════════════════════════════════════ */}
      <section id="mapa-gastronomico" className="home-section-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "4rem 2rem" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
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
              Usa tu GPS o fija tu punto en el mapa para descubrir platos y restaurantes cercanos.
            </p>
          </div>
          <Link href="/negocios" className="section-link">
            Ver todos los negocios <ChevronRight size={13} />
          </Link>
        </div>
        <MapWrapper />
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
          .split-section-body {
            padding: 2.25rem 1.25rem !important;
          }
          .editorial-spread {
            grid-template-columns: 1fr !important;
          }
          .editorial-col-left {
            border-right: none !important;
            border-bottom: 1px solid var(--color-border);
          }
          .editorial-copy {
            padding: 1.75rem 1.25rem !important;
          }
          .home-section-pad {
            padding: 2.5rem 1.25rem !important;
          }
        }
      `}</style>
    </>
  );
}
