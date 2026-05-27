"use client";

import { useState, useEffect } from "react";
import { Star, MapPin, ChevronLeft, DollarSign, Clock, Utensils, Sparkles, MessageSquare } from "lucide-react";
import Link from "next/link";
import type { Plato, LugarConPivot, Resena } from "@/lib/types";

interface PlatoDetailViewProps {
  initialPlato: Plato;
  lugares: LugarConPivot[];
  resenas: Resena[];
}

export function PlatoDetailView({ initialPlato, lugares, resenas }: PlatoDetailViewProps) {
  const [plato, setPlato] = useState<Plato>(initialPlato);
  const [localResenas, setLocalResenas] = useState<Resena[]>(resenas);
  const [reviewAddedBanner, setReviewAddedBanner] = useState<string | null>(null);

  // 1. Load local plate overrides
  useEffect(() => {
    const saved = localStorage.getItem("gastro_platos");
    if (saved) {
      try {
        const list = JSON.parse(saved);
        const match = list.find((p: any) => p.slug === initialPlato.slug);
        if (match) {
          setPlato({
            ...initialPlato,
            nombre: match.nombre,
            descripcion: match.descripcion || initialPlato.descripcion,
            precio_referencial: match.precio_referencial,
            destacado: match.destacado,
            imagen_url: match.imagen_url || initialPlato.imagen_url,
            historia: match.historia || initialPlato.historia,
            ingredientes: match.ingredientes || initialPlato.ingredientes,
          });
        }
      } catch (e) {
        console.error("Error loading local overridden plates:", e);
      }
    }
  }, [initialPlato]);

  // 2. Load custom persistent user/AI reviews from localStorage
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
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Inicio
      </Link>

      {/* Dynamic AI Review Notification Toast (Neon gaming aesthetic) */}
      {reviewAddedBanner && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(16,185,129,0.1))",
            border: "2px solid #10B981",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem",
            marginBottom: "2.0rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 0 20px rgba(16,185,129,0.25)",
            animation: "reviewPulseBanner 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          <div style={{ background: "#10B981", color: "#020617", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "#047857" }}>
              ✨ ¡Reseña Publicada por la IA!
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: 2 }}>
              El asistente GastroCocha ha procesado tu valoración en lenguaje natural y la ha guardado en el perfil.
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        {/* Main info */}
        <div>
          {/* Image */}
          <div
            style={{
              height: 320,
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              position: "relative",
              background: `linear-gradient(135deg, hsl(${(plato.id * 37) % 360}, 60%, 80%), hsl(${(plato.id * 73) % 360}, 50%, 70%))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
            }}
          >
            {plato.imagen_url ? (
              <img
                src={plato.imagen_url}
                alt={plato.nombre}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span style={{ fontSize: "5rem" }}>🍽️</span>
            )}
          </div>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.75rem" }}>{plato.nombre}</h1>
              {plato.provincia && (
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <MapPin size={14} /> {plato.provincia.nombre}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              {plato.promedio_rating && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--color-surface-warm)", padding: "0.4rem 0.8rem", borderRadius: "var(--radius)" }}>
                  <Star size={16} fill="var(--color-primary)" color="var(--color-primary)" />
                  <span style={{ fontWeight: 700 }}>{plato.promedio_rating.toFixed(1)}</span>
                </div>
              )}
              {plato.precio_referencial && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", color: "var(--color-primary-dark)" }}>
                  <DollarSign size={18} /> {plato.precio_referencial.toFixed(0)} Bs
                </div>
              )}
            </div>
          </div>

          <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--color-text)", marginBottom: "1.5rem" }}>{plato.descripcion}</p>

          {/* Details cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {plato.historia && (
              <div className="card" style={{ padding: "1.25rem" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={16} color="var(--color-primary)" /> Historia
                </h3>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>{plato.historia}</p>
              </div>
            )}
            {plato.ingredientes && (
              <div className="card" style={{ padding: "1.25rem" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: 6 }}>
                  <Utensils size={16} color="var(--color-secondary)" /> Ingredientes
                </h3>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>{plato.ingredientes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lugares donde se sirve */}
      {lugares.length > 0 && (
        <section style={{ marginTop: "1rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", marginBottom: "1rem" }}>
            📍 Dónde comerlo ({lugares.length} {lugares.length === 1 ? "lugar" : "lugares"})
          </h2>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {lugares.map((lugar) => (
              <div key={lugar.id} className="card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{lugar.nombre}</div>
                  {lugar.direccion && <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: 2 }}>{lugar.direccion}</div>}
                  {lugar.telefono && <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>📞 {lugar.telefono}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  {lugar.pivot?.precio_aproximado && (
                    <span className="badge badge-primary">{lugar.pivot.precio_aproximado} Bs</span>
                  )}
                  {lugar.pivot?.especialidad && (
                    <span className="badge badge-green">⭐ Especialidad</span>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${lugar.lat},${lugar.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "0.8rem",
                      padding: "0.4rem 0.8rem",
                      textDecoration: "none",
                      borderRadius: "8px",
                      color: "var(--color-primary-dark)",
                      background: "rgba(220, 38, 38, 0.06)",
                      border: "1px solid rgba(220, 38, 38, 0.12)",
                    }}
                  >
                    🗺️ Cómo llegar
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reseñas */}
      <section id="resenas-seccion" style={{ marginTop: "2.5rem" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
          <MessageSquare size={20} color="var(--color-primary)" />
          Reseñas ({localResenas.length})
        </h2>
        {localResenas.length > 0 ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {localResenas.map((resena) => (
              <div 
                key={resena.id} 
                className="card" 
                style={{ 
                  padding: "1rem 1.25rem",
                  animation: resena.user_id === 99 ? "newReviewFade 0.6s cubic-bezier(0.19, 1, 0.22, 1)" : "none",
                  border: resena.user_id === 99 ? "1px solid #10B981" : "1px solid var(--color-border)",
                  boxShadow: resena.user_id === 99 ? "0 0 10px rgba(16,185,129,0.15)" : "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{resena.titulo || "Sin título"}</div>
                  <div className="stars" style={{ fontSize: "0.85rem", color: resena.user_id === 99 ? "#10B981" : "inherit" }}>
                    {"★".repeat(resena.rating)}{"☆".repeat(5 - resena.rating)}
                  </div>
                </div>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>{resena.comentario}</p>
                {resena.user && (
                  <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    — {resena.user.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>Aún no hay reseñas. ¡Sé el primero en opinar!</p>
        )}
      </section>

      <style>{`
        @keyframes reviewPulseBanner {
          0% { transform: translateY(-20px) scale(0.92); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes newReviewFade {
          0% { transform: scale(0.95); background: rgba(16, 185, 129, 0.1); opacity: 0.5; }
          100% { transform: scale(1); background: transparent; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
