import Link from "next/link";
import type { Plato } from "@/lib/types";
import { Star, MapPin } from "lucide-react";

export function PlatoCard({ plato }: { plato: Plato }) {
  const rating = plato.promedio_rating?.toFixed(1) ?? "—";
  const precio = plato.precio_referencial ? `${plato.precio_referencial.toFixed(0)} Bs` : "Consultar";

  return (
    <Link href={`/plato/${plato.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Image placeholder */}
        <div
          style={{
            height: 180,
            background: `linear-gradient(135deg, hsl(${(plato.id * 37) % 360}, 60%, 85%), hsl(${(plato.id * 73) % 360}, 50%, 75%))`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "3rem",
            position: "relative",
          }}
        >
          🍽️
          {plato.destacado && (
            <span
              className="badge badge-primary"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                fontSize: "0.7rem",
              }}
            >
              ⭐ Destacado
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.35rem" }}>
            {plato.nombre}
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", fontSize: "0.8rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--color-primary)" }}>
              <Star size={14} fill="var(--color-primary)" /> {rating}
            </span>
            <span style={{ color: "var(--color-text-muted)" }}>
              {plato.total_resenas} reseñas
            </span>
          </div>

          <p style={{ color: "var(--color-text-muted)", fontSize: "0.82rem", lineHeight: 1.5, flex: 1, marginBottom: "0.75rem" }}>
            {plato.descripcion.length > 100 ? plato.descripcion.slice(0, 100) + "..." : plato.descripcion}
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "var(--color-primary-dark)",
                fontSize: "1rem",
              }}
            >
              {precio}
            </span>
            {plato.provincia && (
              <span style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                <MapPin size={12} /> {plato.provincia.nombre}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
