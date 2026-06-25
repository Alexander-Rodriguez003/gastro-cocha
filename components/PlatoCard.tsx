"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { Plato } from "@/lib/types";
import { Star, MapPin, Utensils } from "lucide-react";

export function PlatoCard({ plato }: { plato: Plato }) {
  const [localPlato, setLocalPlato] = useState(plato);

  useEffect(() => {
    const saved = localStorage.getItem("gastro_platos");
    if (saved) {
      try {
        const list = JSON.parse(saved);
        const match = list.find((p: any) => p.slug === plato.slug);
        if (match) {
          setLocalPlato({
            ...plato,
            nombre: match.nombre,
            precio_referencial: match.precio_referencial,
            destacado: match.destacado,
            imagen_url: match.imagen_url || plato.imagen_url,
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [plato]);

  const rating = localPlato.promedio_rating?.toFixed(1) ?? "—";
  const precio = localPlato.precio_referencial ? `${localPlato.precio_referencial.toFixed(0)} Bs` : "Consultar";

  const linkHref = (localPlato as any).es_especialidad && (localPlato as any).lugar_slug
    ? `/negocio/${(localPlato as any).lugar_slug}`
    : `/plato/${localPlato.slug}`;

  return (
    <Link href={linkHref} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Image */}
        <div
          style={{
            height: 180,
            position: "relative",
            overflow: "hidden",
            background: `linear-gradient(135deg, hsl(${(localPlato.id * 37) % 360}, 60%, 85%), hsl(${(localPlato.id * 73) % 360}, 50%, 75%))`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {localPlato.imagen_url ? (
            <img
              src={localPlato.imagen_url}
              alt={localPlato.nombre}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Utensils size={48} color="var(--color-primary-light)" style={{ opacity: 0.5 }} />
          )}
          {(localPlato as any).es_especialidad ? (
            <span
              className="badge"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                fontSize: "0.7rem",
                zIndex: 2,
                background: "var(--color-secondary)",
                color: "white",
                padding: "0.25rem 0.5rem",
                borderRadius: "6px",
                fontWeight: 700,
                textTransform: "uppercase",
                fontFamily: "var(--font-display)"
              }}
            >
              Especialidad
            </span>
          ) : localPlato.destacado ? (
            <span
              className="badge badge-primary"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                fontSize: "0.7rem",
                zIndex: 2,
              }}
            >
              Destacado
            </span>
          ) : null}
        </div>

        {/* Content */}
        <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.35rem", color: "var(--color-text)" }}>
            {localPlato.nombre}
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", fontSize: "0.8rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--color-primary)" }}>
              <Star size={14} fill="var(--color-primary)" /> {rating}
            </span>
            <span style={{ color: "var(--color-text-muted)" }}>
              {localPlato.total_resenas} reseñas
            </span>
          </div>

          <p style={{ color: "var(--color-text-muted)", fontSize: "0.82rem", lineHeight: 1.5, flex: 1, marginBottom: "0.75rem" }}>
            {localPlato.descripcion && localPlato.descripcion.length > 100 
              ? localPlato.descripcion.slice(0, 100) + "..." 
              : localPlato.descripcion || "Plato típico tradicional."}
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
            {localPlato.provincia && (
              <span style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                <MapPin size={12} /> {localPlato.provincia.nombre}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
