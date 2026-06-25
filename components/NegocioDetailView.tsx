"use client";

import { useState, useEffect } from "react";
import { Star, MapPin, ChevronLeft, Phone, Sparkles, MessageSquare, ArrowRight, Compass, Utensils } from "lucide-react";
import Link from "next/link";
import type { Lugar, Plato, Resena, PlatoConPivot } from "@/lib/types";

interface NegocioDetailViewProps {
  initialLugar: Lugar;
  platos: PlatoConPivot[];
  resenas: Resena[];
}

export function NegocioDetailView({ initialLugar, platos, resenas }: NegocioDetailViewProps) {
  const [lugar, setLugar] = useState<Lugar>(initialLugar);
  const [localResenas, setLocalResenas] = useState<Resena[]>(resenas);
  const [reviewAddedBanner, setReviewAddedBanner] = useState<string | null>(null);

  // Load custom persistent user/AI reviews for this place from localStorage
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

  // Listen for dynamic AI reviews submission
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

        // Trigger dynamic banner
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
            background: "var(--color-surface-warm)",
            border: `1px solid var(--color-primary-light)`,
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem",
            marginBottom: "2.0rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "var(--shadow-md)",
            animation: "reviewPulseBanner 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          <div style={{ background: "var(--color-primary)", color: "#FFFFFF", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--color-primary-dark)" }}>
              ✨ ¡Reseña Publicada por el Chatbot!
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: 2 }}>
              El asistente GastroCocha ha procesado tu valoración en lenguaje natural y la ha guardado en este local.
            </div>
          </div>
        </div>
      )}

      {/* ===== HEADER BANNER (Gastronomic Elegant Cover Layout) ===== */}
      <div
        style={{
          position: "relative",
          height: "380px",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          boxShadow: "var(--shadow-lg)",
          marginBottom: "2.5rem",
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.75)), url(${
              lugar.imagen_url ||
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Content Overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "2.5rem 2rem",
            color: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            zIndex: 2,
          }}
        >
          {/* Badge & Rating row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <span
              style={{
                background: "var(--color-secondary)",
                color: "#FFFFFF",
                padding: "0.4rem 1rem",
                borderRadius: 12,
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              🍽️ Restaurante Verificado
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0, 0, 0, 0.4)", padding: "0.4rem 0.8rem", borderRadius: 12, backdropFilter: "blur(4px)" }}>
              <Star size={16} fill="var(--color-primary-light)" color="var(--color-primary-light)" />
              <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>{avgRating}</span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}>({localResenas.length} opiniones)</span>
            </div>
          </div>

          {/* Restaurant Title */}
          <div>
            <h1
              style={{
                fontFamily: "Georgia, serif",
                fontWeight: 700,
                fontSize: "3rem",
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {lugar.nombre}
            </h1>
            
            {/* Meta details */}
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "1rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.9)" }}>
              {lugar.provincia && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={16} color="var(--color-primary-light)" />
                  <strong>{lugar.provincia.nombre}</strong> (Cochabamba)
                </span>
              )}
              {lugar.direccion && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Compass size={16} color="var(--color-primary-light)" />
                  {lugar.direccion}
                </span>
              )}
              {lugar.telefono && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Phone size={16} color="var(--color-primary-light)" />
                  {lugar.telefono}
                </span>
              )}
            </div>
          </div>

          <hr style={{ border: "0", borderTop: "1px solid rgba(255, 255, 255, 0.2)", margin: "0.5rem 0" }} />

          {/* Business action triggers */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${lugar.lat},${lugar.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "var(--color-primary)",
                  color: "#FFFFFF",
                  padding: "0.75rem 1.5rem",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                }}
              >
                🗺️ Cómo Llegar (Google Maps)
              </a>
              {lugar.telefono && (
                <a
                  href={`tel:${lugar.telefono}`}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "#FFFFFF",
                    padding: "0.75rem 1.25rem",
                    borderRadius: 12,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    backdropFilter: "blur(4px)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  }}
                >
                  📞 Llamar
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== LANDING PAGE LAYOUT GRID ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}>
        
        {/* SIGNATURE DISHES MENU */}
        <section>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1.75rem", display: "flex", alignItems: "center", gap: 8, color: "var(--color-text)" }}>
              <Utensils size={24} color="var(--color-primary)" />
              Menú y Especialidades de la Casa
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginTop: 4 }}>
              Platos típicos que puedes degustar en este establecimiento.
            </p>
          </div>

          {platos.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
              {platos.map((plato) => (
                <div
                  key={plato.id}
                  className="card"
                  style={{
                    padding: "1.5rem",
                    background: "var(--color-bg-card)",
                    border: `1px solid var(--color-border)`,
                    borderRadius: 16,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "1.25rem",
                    transition: "all 0.25s ease-in-out",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem", alignItems: "center" }}>
                      <img
                        src={plato.pivot?.imagen_url || plato.imagen_url || "/images/placeholder-plate.jpg"}
                        alt={plato.nombre}
                        style={{ width: 75, height: 75, borderRadius: "12px", objectFit: "cover", background: "var(--color-border)" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                          <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--color-text)" }}>
                            {plato.nombre}
                          </h3>
                          <span style={{ fontWeight: 700, color: "var(--color-primary-dark)", fontSize: "1.05rem", fontFamily: "var(--font-display)" }}>
                            {plato.pivot?.precio_aproximado || plato.precio_referencial || "—"} Bs
                          </span>
                        </div>
                      </div>
                    </div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: 8, lineHeight: 1.6 }}>
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
                      color: "var(--color-primary)",
                      textDecoration: "none",
                      marginTop: "0.5rem",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary-dark)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-primary)"}
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

          {/* Especialidades de la Casa */}
          {lugar.especialidades && lugar.especialidades.length > 0 && (
            <div style={{ marginTop: "2.5rem" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1.4rem", display: "flex", alignItems: "center", gap: 8, color: "var(--color-text)" }}>
                  <Sparkles size={20} color="var(--color-secondary)" style={{ display: "inline", verticalAlign: "middle" }} />
                  Creaciones y Especialidades Propias
                </h3>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: 4 }}>
                  Platos únicos diseñados por nuestros chefs para consentir tu paladar.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                {lugar.especialidades.map((spec) => (
                  <div
                    key={spec.id}
                    className="card"
                    style={{
                      padding: "1.25rem",
                      background: "var(--color-bg-card)",
                      border: `1px solid var(--color-border)`,
                      borderRadius: 16,
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                      transition: "all 0.25s ease-in-out",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.borderColor = "var(--color-secondary)";
                      e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <img
                      src={spec.imagen_url || "/images/placeholder-plate.jpg"}
                      alt={spec.nombre}
                      style={{ width: 75, height: 75, borderRadius: "12px", objectFit: "cover", background: "var(--color-border)" }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1.05rem", color: "var(--color-text)" }}>
                        {spec.nombre}
                      </h4>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                        <span style={{ fontWeight: 700, color: "var(--color-secondary-dark)", fontSize: "1.05rem", fontFamily: "var(--font-display)" }}>
                          {spec.precio} Bs
                        </span>
                        <span style={{ background: "var(--color-surface-warm)", color: "var(--color-primary-dark)", fontSize: "0.6rem", padding: "0.1rem 0.35rem", borderRadius: 4, fontWeight: 700, textTransform: "uppercase" }}>
                          Especialidad
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* REVIEWS SECTION */}
        <section id="resenas-seccion">
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1.75rem", display: "flex", alignItems: "center", gap: 8, color: "var(--color-text)" }}>
              <MessageSquare size={24} color="var(--color-primary)" />
              Opiniones de los Clientes
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginTop: 4 }}>
              Lo que opinan los amantes de la gastronomía cochabambina sobre este local.
            </p>
          </div>

          {localResenas.length > 0 ? (
            <div style={{ display: "grid", gap: "1rem" }}>
              {localResenas.map((resena) => (
                <div
                  key={resena.id}
                  className="card"
                  style={{
                    padding: "1.5rem",
                    borderRadius: 16,
                    border: resena.user_id === 99 ? `1px solid var(--color-primary-light)` : "1px solid var(--color-border)",
                    background: resena.user_id === 99 ? "var(--color-surface-warm)" : "var(--color-bg-card)",
                    boxShadow: "var(--shadow-sm)",
                    animation: resena.user_id === 99 ? "newReviewFade 0.6s cubic-bezier(0.19, 1, 0.22, 1)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text)", fontFamily: "Georgia, serif" }}>
                      {resena.titulo || "Recomendado"}
                    </div>
                    <div className="stars" style={{ fontSize: "0.85rem" }}>
                      {"★".repeat(resena.rating)}{"☆".repeat(5 - resena.rating)}
                    </div>
                  </div>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>{resena.comentario}</p>
                  {resena.user && (
                    <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
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

      <style>{`
        @keyframes reviewPulseBanner {
          0% { transform: translateY(-20px) scale(0.92); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes newReviewFade {
          0% { transform: scale(0.95); background: var(--color-surface-warm); opacity: 0.5; }
          100% { transform: scale(1); background: var(--color-bg-card); opacity: 1; }
        }
      `}</style>

    </div>
  );
}
