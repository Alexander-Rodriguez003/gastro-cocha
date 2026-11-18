"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Trash2, Search, ExternalLink, MessageSquare } from "lucide-react";

interface ResenaRow {
  id: number;
  targetType: "plato" | "lugar";
  targetName: string;
  targetSlug: string;
  rating: number;
  titulo: string;
  comentario: string;
  usuario: string;
  fecha: string;
}

export default function AdminResenasPage() {
  const [resenas, setResenas] = useState<ResenaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "plato" | "lugar">("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/resenas")
      .then((r) => r.json())
      .then((data) => {
        if (data.resenas) setResenas(data.resenas);
        else setErrorMsg(data.error || "No se pudieron cargar las reseñas.");
      })
      .catch(() => setErrorMsg("Error de conexión al cargar las reseñas."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (row: ResenaRow) => {
    if (!confirm(`¿Eliminar la reseña sobre "${row.targetName}" de ${row.usuario}?`)) return;
    setDeletingId(row.id);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/admin/resenas?id=${row.id}`, { method: "DELETE" });
      if (res.ok) {
        setResenas((prev) => prev.filter((r) => r.id !== row.id));
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "No se pudo eliminar la reseña.");
      }
    } catch {
      setErrorMsg("Error de conexión al eliminar la reseña.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return resenas.filter((r) => {
      if (filterType !== "all" && r.targetType !== filterType) return false;
      if (!term) return true;
      return (
        r.targetName.toLowerCase().includes(term) ||
        r.comentario.toLowerCase().includes(term) ||
        r.titulo.toLowerCase().includes(term) ||
        r.usuario.toLowerCase().includes(term)
      );
    });
  }, [resenas, search, filterType]);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--color-muted)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Panel Admin
      </Link>

      <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "1.75rem", marginBottom: "0.4rem", color: "var(--color-ink)", display: "flex", alignItems: "center", gap: 8 }}>
        <MessageSquare size={24} color="var(--color-amber)" /> Supervisión de Reseñas ({resenas.length})
      </h1>
      <p style={{ color: "var(--color-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        Los comentarios se publican automáticamente tras pasar el filtro anti-ofensas. Si un dueño reporta una reseña dañina o abusiva, puedes eliminarla aquí.
      </p>

      {/* Search & Filter */}
      <div className="card" style={{ padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", flexWrap: "wrap", gap: "0.85rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por plato, local, usuario o comentario..."
            className="input-editorial"
            style={{ paddingLeft: "2.35rem" }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {[
            { id: "all", label: "Todas" },
            { id: "plato", label: "Platos" },
            { id: "lugar", label: "Locales" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilterType(opt.id as "all" | "plato" | "lugar")}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "var(--radius-pill)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                border: filterType === opt.id ? "1px solid var(--color-ink)" : "1px solid var(--color-border)",
                background: filterType === opt.id ? "var(--color-ink)" : "var(--color-cream)",
                color: filterType === opt.id ? "var(--color-cream)" : "var(--color-muted)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div role="alert" style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", fontSize: "0.85rem" }}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--color-muted)" }}>Cargando reseñas...</p>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: "2.5rem", textAlign: "center", color: "var(--color-muted)" }}>
          No hay reseñas que coincidan con el filtro actual.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.85rem" }}>
          {filtered.map((r) => {
            const targetHref = r.targetSlug
              ? r.targetType === "lugar"
                ? `/negocio/${r.targetSlug}`
                : `/plato/${r.targetSlug}`
              : null;

            return (
              <div key={r.id} className="card" style={{ padding: "1.2rem 1.35rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.9rem" }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                      <span className={`badge ${r.targetType === "lugar" ? "badge-forest" : "badge-primary"}`}>
                        {r.targetType === "lugar" ? "Local" : "Plato"}
                      </span>
                      {targetHref ? (
                        <Link href={targetHref} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.02rem", color: "var(--color-ink)", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                          {r.targetName} <ExternalLink size={12} />
                        </Link>
                      ) : (
                        <strong style={{ fontFamily: "var(--font-serif)", fontSize: "1.02rem" }}>{r.targetName}</strong>
                      )}
                      <span className="stars" style={{ fontSize: "0.85rem", marginLeft: "0.25rem" }}>
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                      </span>
                    </div>

                    {r.titulo && (
                      <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "var(--color-ink-soft)", marginBottom: "0.25rem" }}>
                        {r.titulo}
                      </div>
                    )}
                    <p style={{ color: "var(--color-muted)", fontSize: "0.87rem", lineHeight: 1.55, marginBottom: "0.45rem" }}>
                      {r.comentario}
                    </p>
                    <div style={{ fontSize: "0.76rem", color: "var(--color-muted)" }}>
                      Por <strong>{r.usuario}</strong> · {r.fecha} · ID #{r.id}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={deletingId === r.id}
                    onClick={() => handleDelete(r)}
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-danger-bg)",
                      color: "var(--color-danger)",
                      border: "1px solid rgba(220, 38, 38, 0.25)",
                      cursor: deletingId === r.id ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: "0.8rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Trash2 size={14} /> {deletingId === r.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
