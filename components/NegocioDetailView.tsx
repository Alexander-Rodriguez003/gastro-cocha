"use client";

import { useState } from "react";
import { Star, MapPin, ChevronLeft, Phone, Sparkles, MessageSquare, ArrowRight, Compass, Utensils, Navigation, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { Lugar, Resena, PlatoConPivot } from "@/lib/types";
import { OptimizedImage } from "./OptimizedImage";
import { ReviewForm } from "./ReviewForm";

interface NegocioDetailViewProps {
  initialLugar: Lugar;
  platos: PlatoConPivot[];
  resenas: Resena[];
}

export function NegocioDetailView({ initialLugar, platos, resenas }: NegocioDetailViewProps) {
  const lugar = initialLugar;
  const [localResenas, setLocalResenas] = useState<Resena[]>(resenas);

  const hasReviews = localResenas.length > 0;
  const avgRating = hasReviews
    ? (localResenas.reduce((sum, r) => sum + r.rating, 0) / localResenas.length).toFixed(1)
    : null;

  const coverImage = lugar.imagen_url || "/hero-restaurant.jpg";

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      <Link href="/negocios" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--color-muted)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem", fontWeight: 500 }}>
        <ChevronLeft size={16} /> Todos los negocios
      </Link>

      {/* Hero Cover Banner */}
      <div
        style={{
          position: "relative",
          minHeight: 360,
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          boxShadow: "var(--shadow-lg)",
          marginBottom: "2.5rem",
          backgroundColor: "#1A1714",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <OptimizedImage
          src={coverImage}
          fallbackSrc="/hero-restaurant.jpg"
          alt={lugar.nombre}
          fill
          priority
          sizes="(max-width: 1120px) 100vw, 1120px"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: "linear-gradient(to top, rgba(17, 16, 16, 0.92) 0%, rgba(17, 16, 16, 0.56) 55%, rgba(17, 16, 16, 0.2) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "2.25rem 2rem",
            color: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <span className="badge badge-forest" style={{ gap: "0.4rem" }}>
              <CheckCircle2 size={12} /> Local verificado
            </span>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(17, 16, 16, 0.65)", padding: "0.4rem 0.85rem", borderRadius: "var(--radius-pill)", border: "1px solid rgba(255,255,255,0.18)" }}>
              <Star size={14} fill="var(--color-amber)" color="var(--color-amber)" />
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#FFFFFF" }}>
                {avgRating ?? "Nuevo"}
              </span>
              <span style={{ color: "rgba(255,255,255,0.78)", fontSize: "0.78rem" }}>
                ({localResenas.length} {localResenas.length === 1 ? "opinión" : "opiniones"})
              </span>
            </div>
          </div>

          <div>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 800,
                fontSize: "clamp(1.85rem, 4.2vw, 3rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.08,
                color: "#FFFFFF",
                textShadow: "0 2px 10px rgba(0,0,0,0.45)",
              }}
            >
              {lugar.nombre}
            </h1>

            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginTop: "0.9rem", fontSize: "0.9rem", color: "rgba(247,244,238,0.92)" }}>
              {lugar.provincia && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={15} color="var(--color-primary-light)" />
                  <strong>{lugar.provincia.nombre}</strong>
                </span>
              )}
              {lugar.direccion && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Compass size={15} color="var(--color-primary-light)" />
                  {lugar.direccion}
                </span>
              )}
              {lugar.telefono && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Phone size={15} color="var(--color-primary-light)" />
                  {lugar.telefono}
                </span>
              )}
            </div>
          </div>

          {lugar.descripcion && (
            <p style={{ color: "rgba(247,244,238,0.85)", fontSize: "0.92rem", lineHeight: 1.6, maxWidth: 680 }}>
              {lugar.descripcion}
            </p>
          )}

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.16)" }}>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lugar.lat},${lugar.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "var(--color-amber)",
                color: "#FFFFFF",
                padding: "0.65rem 1.35rem",
                borderRadius: "var(--radius-pill)",
                fontWeight: 600,
                fontSize: "0.85rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <Navigation size={14} /> Cómo llegar (Google Maps)
            </a>
            {lugar.telefono && (
              <a
                href={`tel:${lugar.telefono}`}
                style={{
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#FFFFFF",
                  padding: "0.65rem 1.2rem",
                  borderRadius: "var(--radius-pill)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Phone size={14} /> Llamar
              </a>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.75rem" }}>
        {/* Menu */}
        <section>
          <div style={{ marginBottom: "1.35rem" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.65rem", display: "flex", alignItems: "center", gap: 9, color: "var(--color-ink)" }}>
              <Utensils size={22} color="var(--color-amber)" />
              Menú y Especialidades
            </h2>
            <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", marginTop: 4 }}>
              Platos típicos que puedes degustar en este establecimiento.
            </p>
          </div>

          {platos.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
              {platos.map((plato) => (
                <div
                  key={plato.id}
                  className="card"
                  style={{
                    padding: "1.35rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem", alignItems: "center" }}>
                      <OptimizedImage
                        src={plato.pivot?.imagen_url || plato.imagen_url}
                        alt={plato.nombre}
                        width={72}
                        height={72}
                        style={{ width: 72, height: 72, borderRadius: "var(--radius-md)", objectFit: "cover", background: "var(--color-amber-light)", flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.65rem" }}>
                          <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.08rem", color: "var(--color-ink)", lineHeight: 1.25 }}>
                            {plato.nombre}
                          </h3>
                          <span style={{ fontWeight: 700, color: "var(--color-primary-dark)", fontSize: "1rem", fontFamily: "var(--font-serif)", whiteSpace: "nowrap", flexShrink: 0 }}>
                            {plato.pivot?.precio_aproximado || plato.precio_referencial ? `${plato.pivot?.precio_aproximado || plato.precio_referencial} Bs` : "Consultar"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p style={{ color: "var(--color-muted)", fontSize: "0.86rem", lineHeight: 1.55 }}>
                      {plato.descripcion.length > 120 ? `${plato.descripcion.slice(0, 117)}...` : plato.descripcion}
                    </p>
                  </div>

                  <Link
                    href={`/plato/${plato.slug}`}
                    className="section-link"
                    style={{ alignSelf: "flex-start" }}
                  >
                    Ver detalle del plato <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "2.5rem 1.5rem", textAlign: "center", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-lg)", color: "var(--color-muted)" }}>
              No hay platos cargados en este menú aún.
            </div>
          )}

          {/* Especialidades propias */}
          {lugar.especialidades && lugar.especialidades.length > 0 && (
            <div style={{ marginTop: "2.5rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.35rem", display: "flex", alignItems: "center", gap: 8, color: "var(--color-ink)" }}>
                  <Sparkles size={19} color="var(--color-forest)" />
                  Especialidades de la casa
                </h3>
                <p style={{ color: "var(--color-muted)", fontSize: "0.85rem", marginTop: 4 }}>
                  Creaciones propias disponibles en este local.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "1.25rem" }}>
                {lugar.especialidades.map((spec) => (
                  <div
                    key={spec.id}
                    className="card"
                    style={{
                      padding: "1.15rem",
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <OptimizedImage
                      src={spec.imagen_url}
                      alt={spec.nombre}
                      width={70}
                      height={70}
                      style={{ width: 70, height: 70, borderRadius: "var(--radius-md)", objectFit: "cover", background: "var(--color-amber-light)", flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.05rem", color: "var(--color-ink)" }}>
                        {spec.nombre}
                      </h4>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", marginTop: 8 }}>
                        <span style={{ fontWeight: 700, color: "var(--color-forest)", fontSize: "1rem", fontFamily: "var(--font-serif)", whiteSpace: "nowrap" }}>
                          {spec.precio} Bs
                        </span>
                        <span className="badge badge-primary">Especialidad</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Opiniones */}
        <section id="resenas-seccion">
          <div style={{ marginBottom: "1.25rem" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.65rem", display: "flex", alignItems: "center", gap: 8, color: "var(--color-ink)" }}>
              <MessageSquare size={22} color="var(--color-amber)" />
              Opiniones de los clientes ({localResenas.length})
            </h2>
            <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", marginTop: 4 }}>
              Experiencias compartidas sobre este local.
            </p>
          </div>

          <ReviewForm
            lugarSlug={lugar.slug}
            targetLabel={lugar.nombre}
            onReviewAdded={(newResena) => setLocalResenas((prev) => [newResena, ...prev])}
          />

          {localResenas.length > 0 ? (
            <div style={{ display: "grid", gap: "0.9rem" }}>
              {localResenas.map((resena) => (
                <div
                  key={resena.id}
                  className="card"
                  style={{
                    padding: "1.25rem 1.4rem",
                    borderColor: resena.user_id === 99 ? "var(--color-amber)" : "var(--color-border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.55rem" }}>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-ink)", fontFamily: "var(--font-serif)" }}>
                      {resena.titulo || "Recomendado"}
                    </div>
                    <div className="stars" style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      {"★".repeat(resena.rating)}{"☆".repeat(5 - resena.rating)}
                    </div>
                  </div>
                  <p style={{ color: "var(--color-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>{resena.comentario}</p>
                  {resena.user && (
                    <div style={{ marginTop: "0.65rem", fontSize: "0.76rem", color: "var(--color-muted)", fontWeight: 600 }}>
                      — {resena.user.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "2.25rem 1.5rem",
                textAlign: "center",
                border: "1px dashed var(--color-border)",
                borderRadius: "var(--radius-lg)",
                color: "var(--color-muted)",
                fontSize: "0.9rem",
              }}
            >
              Aún no hay reseñas registradas para este local.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
