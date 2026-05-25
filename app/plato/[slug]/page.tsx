import { getPlatoDetail } from "@/lib/data";
import { Star, MapPin, ChevronLeft, DollarSign, Clock, Utensils } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PlatoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPlatoDetail(slug);
  if (!data) notFound();

  const { plato, lugares, resenas } = data;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Inicio
      </Link>

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
              <div key={lugar.id} className="card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{lugar.nombre}</div>
                  {lugar.direccion && <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: 2 }}>{lugar.direccion}</div>}
                  {lugar.telefono && <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>📞 {lugar.telefono}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {lugar.pivot?.precio_aproximado && (
                    <span className="badge badge-primary">{lugar.pivot.precio_aproximado} Bs</span>
                  )}
                  {lugar.pivot?.especialidad && (
                    <span className="badge badge-green">⭐ Especialidad</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reseñas */}
      <section style={{ marginTop: "2.5rem" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", marginBottom: "1rem" }}>
          💬 Reseñas ({resenas.length})
        </h2>
        {resenas.length > 0 ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {resenas.map((resena) => (
              <div key={resena.id} className="card" style={{ padding: "1rem 1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{resena.titulo || "Sin título"}</div>
                  <div className="stars" style={{ fontSize: "0.85rem" }}>
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
    </div>
  );
}
