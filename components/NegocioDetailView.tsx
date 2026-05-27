"use client";

import { useState, useEffect } from "react";
import { Star, MapPin, ChevronLeft, Phone, Share2, Sparkles, Sliders, MessageSquare, Check, ArrowRight, Compass, Utensils } from "lucide-react";
import Link from "next/link";
import type { Lugar, Plato, Resena } from "@/lib/types";

interface NegocioDetailViewProps {
  initialLugar: Lugar;
  platos: Plato[];
  resenas: Resena[];
}

type AccentColor = "green" | "cyan" | "magenta" | "amber";

const ACCENT_THEMES = {
  green: {
    hex: "#10B981",
    bgGlow: "rgba(16, 185, 129, 0.15)",
    borderGlow: "rgba(16, 185, 129, 0.4)",
    gradient: "linear-gradient(135deg, #10B981, #059669)",
  },
  cyan: {
    hex: "#06B6D4",
    bgGlow: "rgba(6, 182, 212, 0.15)",
    borderGlow: "rgba(6, 182, 212, 0.4)",
    gradient: "linear-gradient(135deg, #06B6D4, #0891B2)",
  },
  magenta: {
    hex: "#D946EF",
    bgGlow: "rgba(217, 70, 239, 0.15)",
    borderGlow: "rgba(217, 70, 239, 0.4)",
    gradient: "linear-gradient(135deg, #D946EF, #C084FC)",
  },
  amber: {
    hex: "#F59E0B",
    bgGlow: "rgba(245, 158, 11, 0.15)",
    borderGlow: "rgba(245, 158, 11, 0.4)",
    gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
  },
};

export function NegocioDetailView({ initialLugar, platos, resenas }: NegocioDetailViewProps) {
  const [lugar, setLugar] = useState<Lugar>(initialLugar);
  const [localResenas, setLocalResenas] = useState<Resena[]>(resenas);
  const [activeAccent, setActiveAccent] = useState<AccentColor>("green");
  const [reviewAddedBanner, setReviewAddedBanner] = useState<string | null>(null);

  const theme = ACCENT_THEMES[activeAccent];

  // 1. Load custom saved neon theme accent for this restaurant
  useEffect(() => {
    const savedTheme = localStorage.getItem(`gastro_negocio_theme_${initialLugar.slug}`);
    if (savedTheme && (savedTheme === "green" || savedTheme === "cyan" || savedTheme === "magenta" || savedTheme === "amber")) {
      setActiveAccent(savedTheme);
    }
  }, [initialLugar.slug]);

  // 2. Load custom persistent user/AI reviews for this place from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem(`gastro_reviews_lugar_${initialLugar.slug}`);
    if (savedReviews) {
      try {
        const customList = JSON.parse(savedReviews) as Resena[];
        setLocalResenas([...resenas, ...customList]);
      } catch (e) {
        console.error("Error loading custom local restaurant reviews:", e);
      }
    }
  }, [initialLugar.slug, resenas]);

  // 3. Save theme preference
  const selectTheme = (color: AccentColor) => {
    setActiveAccent(color);
    localStorage.setItem(`gastro_negocio_theme_${initialLugar.slug}`, color);
  };

  // 4. Listen for dynamic AI reviews submission
  useEffect(() => {
    const handleAiAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      const data = customEvent.detail;
      if (!data) return;

      // Match either slug or name roughly
      if (data.action === "add_review" && (data.lugar_slug === initialLugar.slug || data.lugar_name === initialLugar.nombre)) {
        const newReview: Resena = {
          id: Date.now(),
          user_id: 99,
          plato_id: null,
          lugar_id: initialLugar.id,
          rating: Number(data.rating || 5),
          titulo: "Reseña cargada por el Asistente AI",
          comentario: data.comentario || "¡Excelente servicio y comida tradicional exquisita!",
          fecha_visita: null,
          is_approved: true,
          user: { id: 99, name: "Tú (vía Chatbot AI)" },
        };

        // Update active reviews state
        setLocalResenas((prev) => {
          const updated = [...prev, newReview];
          
          // Save in localStorage for persistent offline demonstration
          const savedReviews = localStorage.getItem(`gastro_reviews_lugar_${initialLugar.slug}`);
          let customList: Resena[] = [];
          if (savedReviews) {
            try {
              customList = JSON.parse(savedReviews);
            } catch {}
          }
          customList.push(newReview);
          localStorage.setItem(`gastro_reviews_lugar_${initialLugar.slug}`, JSON.stringify(customList));
          
          return updated;
        });

        // Trigger dynamic glow toast
        setReviewAddedBanner(`⭐ ¡Tu valoración de ${newReview.rating} estrellas ha sido publicada por la IA!`);
        setTimeout(() => setReviewAddedBanner(null), 7000);

        // Smooth scroll to reviews section
        document.getElementById("resenas-seccion")?.scrollIntoView({ behavior: "smooth" });
      }
    };

    window.addEventListener("gastro_action", handleAiAction);
    return () => {
      window.removeEventListener("gastro_action", handleAiAction);
    };
  }, [initialLugar]);

  // Calculate average rating
  const avgRating = localResenas.length > 0
    ? (localResenas.reduce((sum, r) => sum + r.rating, 0) / localResenas.length).toFixed(1)
    : "4.8";

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      
      {/* Back button */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Inicio
      </Link>

      {/* Dynamic AI Review Notification Toast */}
      {reviewAddedBanner && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(16,185,129,0.1))",
            border: `2px solid ${theme.hex}`,
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem",
            marginBottom: "2.0rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: `0 0 20px ${theme.bgGlow}`,
            animation: "reviewPulseBanner 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          <div style={{ background: theme.hex, color: "#020617", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: theme.hex }}>
              ✨ ¡Reseña Publicada por el Chatbot!
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: 2 }}>
              El asistente GastroCocha ha procesado tu valoración en lenguaje natural y la ha guardado en este local.
            </div>
          </div>
        </div>
      )}

      {/* ===== HEADER BANNER (Geometry Dash Cyber Neon Space Layout) ===== */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a, #020617)",
          border: `2px solid ${theme.hex}`,
          borderRadius: 24,
          padding: "2.5rem 2rem",
          color: "#FFFFFF",
          boxShadow: `0 0 30px ${theme.bgGlow}, 0 20px 40px rgba(0,0,0,0.5)`,
          marginBottom: "2.5rem",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.5s ease",
        }}
      >
        {/* Decorative Grid Mesh Background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)",
            backgroundSize: "24px 24px",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Badge & Rating row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <span
              style={{
                background: theme.bgGlow,
                border: `1px solid ${theme.hex}`,
                color: theme.hex,
                padding: "0.4rem 1rem",
                borderRadius: 12,
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                textShadow: `0 0 8px ${theme.hex}`,
              }}
            >
              🚀 Restaurante Verificado
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255, 255, 255, 0.05)", padding: "0.4rem 0.8rem", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
              <Star size={16} fill={theme.hex} color={theme.hex} style={{ filter: `drop-shadow(0 0 4px ${theme.hex})` }} />
              <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>{avgRating}</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>({localResenas.length} opiniones)</span>
            </div>
          </div>

          {/* Restaurant Title */}
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "2.75rem",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                textShadow: `0 0 20px ${theme.bgGlow}`,
              }}
            >
              {lugar.nombre}
            </h1>
            
            {/* Meta details */}
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginTop: "1rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>
              {lugar.provincia && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={16} color={theme.hex} />
                  <strong>{lugar.provincia.nombre}</strong> (Cochabamba)
                </span>
              )}
              {lugar.direccion && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Compass size={16} color={theme.hex} />
                  {lugar.direccion}
                </span>
              )}
              {lugar.telefono && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Phone size={16} color={theme.hex} />
                  {lugar.telefono}
                </span>
              )}
            </div>
          </div>

          <hr style={{ border: "0", borderTop: "1px solid rgba(255, 255, 255, 0.1)", margin: "0.5rem 0" }} />

          {/* Business action triggers */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${lugar.lat},${lugar.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: theme.gradient,
                  color: "#020617",
                  padding: "0.75rem 1.5rem",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: `0 0 15px ${theme.hex}`,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                🗺️ Cómo Llegar (Google Maps)
              </a>
              {lugar.telefono && (
                <a
                  href={`tel:${lugar.telefono}`}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#FFFFFF",
                    padding: "0.75rem 1.25rem",
                    borderRadius: 12,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  📞 Llamar
                </a>
              )}
            </div>

            {/* ===== GEOMETRY DASH THEME CUSTOMIZER BUTTON WHEEL ===== */}
            <div
              style={{
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "0.5rem 0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 4 }}>
                <Sliders size={12} color={theme.hex} /> Accent:
              </span>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                {(["green", "cyan", "magenta", "amber"] as AccentColor[]).map((col) => (
                  <button
                    key={col}
                    onClick={() => selectTheme(col)}
                    aria-label={`Theme ${col}`}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: ACCENT_THEMES[col].gradient,
                      border: activeAccent === col ? "2px solid #FFFFFF" : "1px solid rgba(0,0,0,0.3)",
                      boxShadow: activeAccent === col ? `0 0 10px ${ACCENT_THEMES[col].hex}` : "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {activeAccent === col && <Check size={10} color="#000000" style={{ strokeWidth: 3 }} />}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ===== LANDING PAGE LAYOUT GRID ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}>
        
        {/* SIGNATURE DISHES MENU */}
        <section>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
              <Utensils size={24} color={theme.hex} />
              Menú y Especialidades de la Casa
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginTop: 4 }}>
              Platos típicos que puedes degustar en este establecimiento.
            </p>
          </div>

          {platos.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
              {platos.map((plato) => (
                <div
                  key={plato.id}
                  className="card"
                  style={{
                    padding: "1.25rem",
                    border: `1px solid rgba(28,25,23,0.08)`,
                    borderRadius: 16,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "1rem",
                    transition: "all 0.3s ease",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = theme.hex;
                    e.currentTarget.style.boxShadow = `0 10px 20px ${theme.bgGlow}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgba(28,25,23,0.08)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem" }}>{plato.nombre}</h3>
                      {plato.precio_referencial && (
                        <span style={{ fontWeight: 800, color: "var(--color-primary-dark)", fontSize: "1.05rem" }}>
                          {plato.precio_referencial} Bs
                        </span>
                      )}
                    </div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: 6, lineHeight: 1.5 }}>
                      {plato.descripcion.length > 120 ? `${plato.descripcion.slice(0, 117)}...` : plato.descripcion}
                    </p>
                  </div>

                  <Link
                    href={`/plato/${plato.slug}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: theme.hex,
                      textDecoration: "none",
                      marginTop: "0.5rem",
                    }}
                  >
                    Ver detalle del plato <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "3rem 1.5rem", textAlign: "center", border: "1px dashed rgba(28, 25, 23, 0.12)", borderRadius: 16, color: "var(--color-text-muted)" }}>
              No hay especialidades cargadas en este menú aún.
            </div>
          )}
        </section>

        {/* REVIEWS SECTION */}
        <section id="resenas-seccion">
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={24} color={theme.hex} />
              Opiniones de los Clientes
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginTop: 4 }}>
              Lo que opinan los amantes de la gastronomía cochabambina sobre este local.
            </p>
          </div>

          {localResenas.length > 0 ? (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {localResenas.map((resena) => (
                <div
                  key={resena.id}
                  className="card"
                  style={{
                    padding: "1.25rem",
                    borderRadius: 16,
                    border: resena.user_id === 99 ? `1px solid ${theme.hex}` : "1px solid var(--color-border)",
                    background: resena.user_id === 99 ? "rgba(255,255,255,0.01)" : "var(--color-surface)",
                    boxShadow: resena.user_id === 99 ? `0 0 10px ${theme.bgGlow}` : "none",
                    animation: resena.user_id === 99 ? "newReviewFade 0.6s cubic-bezier(0.19, 1, 0.22, 1)" : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{resena.titulo || "Recomendado"}</div>
                    <div className="stars" style={{ fontSize: "0.85rem", color: resena.user_id === 99 ? theme.hex : "inherit" }}>
                      {"★".repeat(resena.rating)}{"☆".repeat(5 - resena.rating)}
                    </div>
                  </div>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>{resena.comentario}</p>
                  {resena.user && (
                    <div style={{ marginTop: "0.6rem", fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
                      — {resena.user.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "3rem 1.5rem",
                textAlign: "center",
                background: "rgba(28, 25, 23, 0.02)",
                border: "1px dashed rgba(28, 25, 23, 0.12)",
                borderRadius: 16,
                color: "var(--color-text-muted)",
              }}
            >
              Aún no hay reseñas registradas para este negocio. ¡Sé el primero en chatear con la IA para agregar tu valoración!
            </div>
          )}
        </section>

      </div>

      {/* Rhythmic Game keyframes styles */}
      <style>{`
        @keyframes reviewPulseBanner {
          0% { transform: translateY(-20px) scale(0.92); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes newReviewFade {
          0% { transform: scale(0.95); background: ${theme.bgGlow}; opacity: 0.5; }
          100% { transform: scale(1); background: transparent; opacity: 1; }
        }
        .hover-neon-text:hover {
          color: ${theme.hex} !important;
          text-shadow: 0 0 5px ${theme.hex};
        }
      `}</style>

    </div>
  );
}
