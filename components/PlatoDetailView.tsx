"use client";

import { useState, useEffect } from "react";
import { Star, MapPin, ChevronLeft, Clock, Utensils, Sparkles, MessageSquare, Navigation } from "lucide-react";
import Link from "next/link";
import type { Plato, LugarConPivot, Resena } from "@/lib/types";
import { OptimizedImage } from "./OptimizedImage";

interface PlatoDetailViewProps {
  initialPlato: Plato;
  lugares: LugarConPivot[];
  resenas: Resena[];
}

export function PlatoDetailView({ initialPlato, lugares, resenas }: PlatoDetailViewProps) {
  const plato = initialPlato;
  const [localResenas, setLocalResenas] = useState<Resena[]>(resenas);
  const [reviewAddedBanner, setReviewAddedBanner] = useState<string | null>(null);

  // Load custom persistent AI reviews from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem(`gastro_reviews_${initialPlato.slug}`);
    if (savedReviews) {
      try {
        const customList = JSON.parse(savedReviews) as Resena[];
        setLocalResenas([...resenas, ...customList]);
      } catch (e) {
        console.error("Error loading custom local reviews:", e);
      }
    }
  }, [initialPlato.slug, resenas]);

  // 3. Listen for dynamic AI reviews submission
  useEffect(() => {
    const handleAiAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      const data = customEvent.detail;
      if (!data) return;

      if (data.action === "add_review" && data.plato_slug === initialPlato.slug) {
        const newReview: Resena = {
          id: Date.now(),
          user_id: 99,
          plato_id: initialPlato.id,
          lugar_id: null,
          rating: Number(data.rating || 5),
          titulo: "Reseña cargada por el Asistente AI",
          comentario: data.comentario || "¡Excelente recomendación gastronómica tradicional!",
          fecha_visita: null,
          is_approved: true,
          user: { id: 99, name: "Tú (vía Chatbot AI)" },
        };

        // Update active state
        setLocalResenas((prev) => {
          const updated = [...prev, newReview];
          
          // Save in localStorage for offline persistence
          const savedReviews = localStorage.getItem(`gastro_reviews_${initialPlato.slug}`);
          let customList: Resena[] = [];
          if (savedReviews) {
            try {
              customList = JSON.parse(savedReviews);
            } catch {}
          }
          customList.push(newReview);
          localStorage.setItem(`gastro_reviews_${initialPlato.slug}`, JSON.stringify(customList));
          
          return updated;
        });

        // Trigger dynamic glow toast
        setReviewAddedBanner(`⭐ ¡Reseña de ${newReview.rating} estrellas agregada con éxito!`);
        setTimeout(() => setReviewAddedBanner(null), 7000);

        // Smooth scroll to reviews section
        document.getElementById("resenas-seccion")?.scrollIntoView({ behavior: "smooth" });
      }
    };

    window.addEventListener("gastro_action", handleAiAction);
    return () => {
      window.removeEventListener("gastro_action", handleAiAction);
    };
  }, [initialPlato]);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--color-muted)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem", fontWeight: 500 }}>
        <ChevronLeft size={16} /> Volver al inicio
      </Link>

      {/* Dynamic AI Review Notification Toast */}
      {reviewAddedBanner && (
        <div
          style={{
            background: "var(--color-amber-light)",
            border: "1px solid var(--color-amber)",
            borderRadius: "var(--radius-lg)",
            padding: "1.1rem 1.25rem",
            marginBottom: "1.75rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "var(--shadow-sm)",
            animation: "reviewPulseBanner 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          <div style={{ background: "var(--color-ink)", color: "var(--color-cream)", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Sparkles size={17} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1rem", color: "var(--color-ink)" }}>
              Reseña publicada por el asistente
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-muted)", marginTop: 2 }}>
              {reviewAddedBanner}
            </div>
          </div>
        </div>
      )}

      <div>
        {/* Image */}
        <div
          style={{
            height: "clamp(240px, 42vw, 380px)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            position: "relative",
            background: "var(--color-amber-light)",
            border: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.75rem",
          }}
        >
          {plato.imagen_url ? (
            <OptimizedImage
              src={plato.imagen_url}
              alt={plato.nombre}
              fill
              priority
              sizes="(max-width: 1120px) 100vw, 1120px"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <Utensils size={56} color="var(--color-primary)" style={{ opacity: 0.45 }} />
          )}
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            {plato.provincia && (
              <Link
                href={`/provincia/${plato.provincia.slug}`}
                className="badge badge-forest"
                style={{ marginBottom: "0.65rem", textDecoration: "none" }}
              >
                <MapPin size={11} /> {plato.provincia.nombre}
              </Link>
            )}
            <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "clamp(1.85rem, 4vw, 2.5rem)", color: "var(--color-ink)", letterSpacing: "-0.02em" }}>
              {plato.nombre}
            </h1>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            {plato.promedio_rating && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--color-amber-light)", padding: "0.45rem 0.9rem", borderRadius: "var(--radius-pill)", border: "1px solid var(--color-border)" }}>
                <Star size={15} fill="var(--color-amber)" color="var(--color-amber)" />
                <span style={{ fontWeight: 700, color: "var(--color-ink)" }}>{plato.promedio_rating.toFixed(1)}</span>
              </div>
            )}
            {plato.precio_referencial && (
              <div style={{ display: "inline-flex", alignItems: "baseline", gap: 6, background: "var(--color-bg-card)", border: "1px solid var(--color-border)", padding: "0.4rem 1rem", borderRadius: "var(--radius-pill)" }}>
                <span style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-muted)", fontWeight: 600 }}>Ref.</span>
                <span style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "1.2rem", color: "var(--color-primary-dark)", whiteSpace: "nowrap" }}>
                  {plato.precio_referencial.toFixed(0)} Bs
                </span>
              </div>
            )}
          </div>
        </div>

        <p style={{ fontSize: "1.02rem", lineHeight: 1.75, color: "var(--color-ink-soft)", marginBottom: "2rem", maxWidth: 780 }}>
          {plato.descripcion}
        </p>

        {/* Details cards */}
        {(plato.historia || plato.ingredientes) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
            {plato.historia && (
              <div className="card" style={{ padding: "1.35rem" }}>
                <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.08rem", marginBottom: "0.55rem", display: "flex", alignItems: "center", gap: 7, color: "var(--color-primary-dark)" }}>
                  <Clock size={16} /> Historia y tradición
                </h2>
                <p style={{ color: "var(--color-muted)", fontSize: "0.88rem", lineHeight: 1.65 }}>{plato.historia}</p>
              </div>
            )}
            {plato.ingredientes && (
              <div className="card" style={{ padding: "1.35rem" }}>
                <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.08rem", marginBottom: "0.55rem", display: "flex", alignItems: "center", gap: 7, color: "var(--color-forest)" }}>
                  <Utensils size={16} /> Ingredientes principales
                </h2>
                <p style={{ color: "var(--color-muted)", fontSize: "0.88rem", lineHeight: 1.65 }}>{plato.ingredientes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lugares donde se sirve */}
      {lugares.length > 0 && (
        <section style={{ marginTop: "1rem", marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.5rem", marginBottom: "1rem", color: "var(--color-ink)" }}>
            Dónde comerlo ({lugares.length} {lugares.length === 1 ? "lugar" : "lugares"})
          </h2>
          <div style={{ display: "grid", gap: "0.85rem" }}>
            {lugares.map((lugar) => (
              <div key={lugar.id} className="card" style={{ padding: "1.15rem 1.35rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <Link href={`/negocio/${lugar.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.08rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, color: "var(--color-ink)" }} className="hover-gastro-text">
                      {lugar.nombre} <span style={{ fontSize: "0.85rem", opacity: 0.55 }}>→</span>
                    </div>
                  </Link>
                  {lugar.direccion && <div style={{ color: "var(--color-muted)", fontSize: "0.82rem", marginTop: 3 }}>{lugar.direccion}</div>}
                  {lugar.telefono && <div style={{ color: "var(--color-muted)", fontSize: "0.82rem" }}>Tel: {lugar.telefono}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
                  {lugar.pivot?.precio_aproximado && (
                    <span className="badge badge-primary" style={{ whiteSpace: "nowrap" }}>{lugar.pivot.precio_aproximado} Bs</span>
                  )}
                  {lugar.pivot?.especialidad && (
                    <span className="badge badge-forest">Especialidad</span>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${lugar.lat},${lugar.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}
                  >
                    <Navigation size={13} /> Cómo llegar
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reseñas */}
      <section id="resenas-seccion">
        <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8, color: "var(--color-ink)" }}>
          <MessageSquare size={20} color="var(--color-amber)" />
          Reseñas ({localResenas.length})
        </h2>
        {localResenas.length > 0 ? (
          <div style={{ display: "grid", gap: "0.85rem" }}>
            {localResenas.map((resena) => (
              <div
                key={resena.id}
                className="card"
                style={{
                  padding: "1.15rem 1.35rem",
                  animation: resena.user_id === 99 ? "newReviewFade 0.6s cubic-bezier(0.19, 1, 0.22, 1)" : "none",
                  borderColor: resena.user_id === 99 ? "var(--color-amber)" : "var(--color-border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.45rem" }}>
                  <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "0.98rem", color: "var(--color-ink)" }}>{resena.titulo || "Opinión"}</div>
                  <div className="stars" style={{ fontSize: "0.85rem", color: "var(--color-amber)", whiteSpace: "nowrap" }}>
                    {"★".repeat(resena.rating)}{"☆".repeat(5 - resena.rating)}
                  </div>
                </div>
                <p style={{ color: "var(--color-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>{resena.comentario}</p>
                {resena.user && (
                  <div style={{ marginTop: "0.6rem", fontSize: "0.76rem", color: "var(--color-muted)", fontWeight: 600 }}>
                    — {resena.user.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "2rem 1.5rem", textAlign: "center", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-lg)", color: "var(--color-muted)", fontSize: "0.9rem" }}>
            Aún no hay reseñas aprobadas para este plato.
          </div>
        )}
      </section>

      <style>{`
        @keyframes reviewPulseBanner {
          0% { transform: translateY(-20px) scale(0.92); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes newReviewFade {
          0% { transform: scale(0.95); background: rgba(200, 112, 42, 0.06); opacity: 0.5; }
          100% { transform: scale(1); background: var(--color-bg-card); opacity: 1; }
        }
        .hover-gastro-text {
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .hover-gastro-text:hover {
          color: var(--color-primary-dark) !important;
          transform: translateX(3px);
        }
      `}</style>
    </div>
  );
}
