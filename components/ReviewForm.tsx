"use client";

import { useState } from "react";
import { Star, Send, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Resena } from "@/lib/types";
import { checkOffensiveContent, OFFENSIVE_REVIEW_WARNING } from "@/lib/moderation";

interface ReviewFormProps {
  platoSlug?: string;
  lugarSlug?: string;
  targetLabel: string;
  onReviewAdded: (resena: Resena) => void;
}

export function ReviewForm({ platoSlug, lugarSlug, targetLabel, onReviewAdded }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [titulo, setTitulo] = useState("");
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (comentario.trim().length < 5) {
      setErrorMsg("Por favor escribe al menos 5 caracteres en tu comentario.");
      return;
    }

    // Validación instantánea local (el servidor también valida siempre)
    const mod = checkOffensiveContent(authorName, titulo, comentario);
    if (mod.isOffensive) {
      setErrorMsg(OFFENSIVE_REVIEW_WARNING);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plato_slug: platoSlug,
          lugar_slug: lugarSlug,
          rating,
          author_name: authorName.trim(),
          titulo: titulo.trim(),
          comentario: comentario.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Conserva todas las entradas del usuario si hay error o advertencia
        setErrorMsg(data.error || "No se pudo publicar la reseña.");
        return;
      }

      if (data.resena) {
        onReviewAdded(data.resena);
      }
      setTitulo("");
      setComentario("");
      setRating(5);
      setSuccessMsg("Tu reseña ya está publicada. ¡Gracias por compartir tu experiencia!");
      router.refresh();
    } catch {
      setErrorMsg("Error de conexión al publicar tu reseña.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card"
      style={{
        padding: "1.35rem 1.5rem",
        marginBottom: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div>
        <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.12rem", color: "var(--color-ink)" }}>
          Deja tu opinión sobre {targetLabel}
        </h3>
        <p style={{ color: "var(--color-muted)", fontSize: "0.84rem", marginTop: 3 }}>
          Se permiten críticas constructivas y opiniones honestas sin insultos ni lenguaje ofensivo.
        </p>
      </div>

      {/* Star rating */}
      <div>
        <span style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--color-ink-soft)" }}>
          Calificación
        </span>
        <div style={{ display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`}
              aria-pressed={rating === value}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.2rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Star
                size={22}
                fill={value <= rating ? "var(--color-amber)" : "none"}
                color={value <= rating ? "var(--color-amber)" : "var(--color-border)"}
              />
            </button>
          ))}
          <span style={{ fontSize: "0.82rem", color: "var(--color-muted)", marginLeft: "0.4rem", fontWeight: 600 }}>
            {rating}/5
          </span>
        </div>
      </div>

      <div className="responsive-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
        <div>
          <label htmlFor={`rev-name-${platoSlug || lugarSlug}`} style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.3rem" }}>
            Tu nombre (opcional)
          </label>
          <input
            id={`rev-name-${platoSlug || lugarSlug}`}
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Ej: Carlos M. (o tu cuenta actual)"
            className="input-editorial"
          />
        </div>
        <div>
          <label htmlFor={`rev-title-${platoSlug || lugarSlug}`} style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.3rem" }}>
            Título breve (opcional)
          </label>
          <input
            id={`rev-title-${platoSlug || lugarSlug}`}
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Buena porción y sabor"
            className="input-editorial"
          />
        </div>
      </div>

      <div>
        <label htmlFor={`rev-comment-${platoSlug || lugarSlug}`} style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.3rem" }}>
          Comentario *
        </label>
        <textarea
          id={`rev-comment-${platoSlug || lugarSlug}`}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Comparte cómo estuvo el plato, la atención o qué se puede mejorar..."
          rows={3}
          required
          className="input-editorial"
          style={{ resize: "vertical" }}
        />
      </div>

      {errorMsg && (
        <div
          role="alert"
          style={{
            background: "var(--color-danger-bg)",
            color: "var(--color-danger)",
            border: "1px solid rgba(220, 38, 38, 0.25)",
            padding: "0.75rem 0.95rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.85rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "flex-start",
            gap: "0.55rem",
          }}
        >
          <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          style={{
            background: "var(--color-surface-green)",
            color: "var(--color-secondary-dark)",
            border: "1px solid rgba(42, 92, 63, 0.25)",
            padding: "0.75rem 0.95rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.85rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "0.55rem",
          }}
        >
          <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary"
          style={{ opacity: submitting ? 0.7 : 1 }}
        >
          <Send size={14} /> {submitting ? "Publicando..." : "Publicar reseña"}
        </button>
      </div>
    </form>
  );
}
