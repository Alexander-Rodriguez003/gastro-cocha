"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Check, X, Star } from "lucide-react";

interface ResenaRow {
  id: number;
  plato_slug: string;
  tipo: "plato" | "lugar";
  rating: number;
  titulo: string;
  comentario: string;
  usuario: string;
  fecha: string;
  is_approved: boolean;
  reviewed: boolean;
}

export default function AdminResenasPage() {
  const [resenas, setResenas] = useState<ResenaRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResenas = async () => {
    try {
      const res = await fetch("/api/admin/resenas");
      const data = await res.json();
      if (data.resenas) {
        setResenas(data.resenas);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResenas();
  }, []);

  const moderate = async (id: number, approve: boolean) => {
    try {
      const res = await fetch("/api/admin/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approve }),
      });
      if (res.ok) {
        setResenas((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_approved: approve, reviewed: true } : r))
        );
      } else {
        alert("Error al moderar la reseña.");
      }
    } catch {
      alert("Error de conexión con el servidor.");
    }
  };

  const pendientes = resenas.filter((r) => !r.reviewed);
  const aprobadas = resenas.filter((r) => r.reviewed && r.is_approved);
  const rechazadas = resenas.filter((r) => r.reviewed && !r.is_approved);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Panel Admin
      </Link>

      <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "1.75rem", marginBottom: "0.5rem" }}>
        💬 Moderar Reseñas
      </h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
        Aprueba o rechaza reseñas antes de que sean visibles al público.
      </p>

      {/* Pendientes */}
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "1.1rem", marginBottom: "1rem", color: "var(--color-primary)" }}>
        ⏳ Pendientes ({pendientes.length})
      </h2>
      {pendientes.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)", fontStyle: "italic", marginBottom: "2rem" }}>Todas las reseñas están moderadas 🎉</p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem", marginBottom: "2.5rem" }}>
          {pendientes.map((r) => (
            <div key={r.id} className="card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--color-primary-light)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{r.titulo}</span>
                    <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: "0.7rem", background: r.tipo === "plato" ? "var(--color-surface-warm)" : "var(--color-info-bg)", color: r.tipo === "plato" ? "var(--color-primary-dark)" : "var(--color-info)" }}>
                      {r.tipo === "plato" ? "🍽️ Plato" : "📍 Lugar"}
                    </span>
                  </div>
                  <div style={{ color: "var(--color-primary)", marginBottom: "0.25rem", letterSpacing: 2, fontSize: "0.85rem" }}>
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </div>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "0.35rem" }}>{r.comentario}</p>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    Por {r.usuario} · {r.fecha} · sobre: {r.plato_slug}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => moderate(r.id, true)} style={{ padding: "0.45rem 0.85rem", borderRadius: 10, background: "var(--color-secondary)", color: "white", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }}>
                    <Check size={14} /> Aprobar
                  </button>
                  <button onClick={() => moderate(r.id, false)} style={{ padding: "0.45rem 0.85rem", borderRadius: 10, background: "#EF4444", color: "white", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }}>
                    <X size={14} /> Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
        <span>✅ Aprobadas: {aprobadas.length}</span>
        <span>❌ Rechazadas: {rechazadas.length}</span>
      </div>
    </div>
  );
}
