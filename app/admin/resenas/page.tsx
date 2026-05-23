"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Check, X, Star } from "lucide-react";
import { RESENAS_SEED } from "@/lib/seed-data";

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
  const [resenas, setResenas] = useState<ResenaRow[]>([
    ...RESENAS_SEED.map((r, i) => ({
      id: i + 1,
      plato_slug: r.plato_slug,
      tipo: "plato" as const,
      rating: r.rating,
      titulo: r.titulo,
      comentario: r.comentario,
      usuario: "Usuario Demo",
      fecha: "2026-05-20",
      is_approved: r.is_approved,
      reviewed: r.is_approved,
    })),
    // Add some pending ones
    {
      id: 100, plato_slug: "silpancho", tipo: "plato", rating: 2, titulo: "No me gustó",
      comentario: "La carne estaba muy delgada y sin sabor.", usuario: "Carlos P.",
      fecha: "2026-05-22", is_approved: false, reviewed: false,
    },
    {
      id: 101, plato_slug: "pension-dona-rosa", tipo: "lugar", rating: 5, titulo: "Excelente atención",
      comentario: "Doña Rosa atiende como en casa. La mejor pensión de Cochabamba sin duda.",
      usuario: "María L.", fecha: "2026-05-22", is_approved: false, reviewed: false,
    },
  ]);

  const moderate = (id: number, approve: boolean) => {
    setResenas((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_approved: approve, reviewed: true } : r))
    );
  };

  const pendientes = resenas.filter((r) => !r.reviewed);
  const aprobadas = resenas.filter((r) => r.reviewed && r.is_approved);
  const rechazadas = resenas.filter((r) => r.reviewed && !r.is_approved);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 4, color: "#78716C", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Panel Admin
      </Link>

      <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "1.75rem", marginBottom: "0.5rem" }}>
        💬 Moderar Reseñas
      </h1>
      <p style={{ color: "#78716C", marginBottom: "2rem", fontSize: "0.9rem" }}>
        Aprueba o rechaza reseñas antes de que sean visibles al público.
      </p>

      {/* Pendientes */}
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "1.1rem", marginBottom: "1rem", color: "#D97706" }}>
        ⏳ Pendientes ({pendientes.length})
      </h2>
      {pendientes.length === 0 ? (
        <p style={{ color: "#78716C", fontStyle: "italic", marginBottom: "2rem" }}>Todas las reseñas están moderadas 🎉</p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem", marginBottom: "2.5rem" }}>
          {pendientes.map((r) => (
            <div key={r.id} className="card" style={{ padding: "1.25rem", borderLeft: "4px solid #F59E0B" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{r.titulo}</span>
                    <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: "0.7rem", background: r.tipo === "plato" ? "#FEF3C7" : "#DBEAFE", color: r.tipo === "plato" ? "#B45309" : "#1E40AF" }}>
                      {r.tipo === "plato" ? "🍽️ Plato" : "📍 Lugar"}
                    </span>
                  </div>
                  <div style={{ color: "#D97706", marginBottom: "0.25rem", letterSpacing: 2, fontSize: "0.85rem" }}>
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </div>
                  <p style={{ color: "#78716C", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "0.35rem" }}>{r.comentario}</p>
                  <div style={{ fontSize: "0.75rem", color: "#A8A29E" }}>
                    Por {r.usuario} · {r.fecha} · sobre: {r.plato_slug}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => moderate(r.id, true)} style={{ padding: "0.45rem 0.85rem", borderRadius: 10, background: "#059669", color: "white", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }}>
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
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontSize: "0.85rem", color: "#78716C" }}>
        <span>✅ Aprobadas: {aprobadas.length}</span>
        <span>❌ Rechazadas: {rechazadas.length}</span>
      </div>
    </div>
  );
}
