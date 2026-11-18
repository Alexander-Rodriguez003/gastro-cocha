"use client";
import Link from "next/link";
import type { Plato } from "@/lib/types";
import { Star, MapPin, Utensils } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";

export function PlatoCard({ plato }: { plato: Plato }) {
  const rating = plato.promedio_rating?.toFixed(1) ?? "—";
  const precio = plato.precio_referencial ? `${plato.precio_referencial.toFixed(0)} Bs` : "Consultar";
  const resenasLabel = plato.total_resenas === 1 ? "1 reseña" : `${plato.total_resenas} reseñas`;

  const isEspecialidad = Boolean((plato as Plato & { es_especialidad?: boolean }).es_especialidad);
  const lugarSlug = (plato as Plato & { lugar_slug?: string | null }).lugar_slug;

  const linkHref = isEspecialidad && lugarSlug ? `/negocio/${lugarSlug}` : `/plato/${plato.slug}`;

  return (
    <Link href={linkHref} style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}>
      <article className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Image */}
        <div
          className="card-img-wrap"
          style={{
            height: 185,
            position: "relative",
            background: "var(--color-amber-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {plato.imagen_url ? (
            <OptimizedImage
              src={plato.imagen_url}
              alt={plato.nombre}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <Utensils size={42} color="var(--color-primary)" style={{ opacity: 0.45 }} />
          )}

          {isEspecialidad ? (
            <span
              className="badge badge-forest"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 2,
              }}
            >
              Especialidad
            </span>
          ) : plato.destacado ? (
            <span
              className="badge badge-ink"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 2,
              }}
            >
              Destacado
            </span>
          ) : null}
        </div>

        {/* Content */}
        <div style={{ padding: "1.15rem", flex: 1, display: "flex", flexDirection: "column" }}>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 700,
              fontSize: "1.125rem",
              marginBottom: "0.4rem",
              color: "var(--color-ink)",
              lineHeight: 1.25,
            }}
          >
            {plato.nombre}
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.55rem", fontSize: "0.8rem" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--color-primary-dark)", fontWeight: 600 }}>
              <Star size={13} fill="var(--color-amber)" color="var(--color-amber)" /> {rating}
            </span>
            <span style={{ color: "var(--color-muted)" }}>{resenasLabel}</span>
          </div>

          <p style={{ color: "var(--color-muted)", fontSize: "0.84rem", lineHeight: 1.55, flex: 1, marginBottom: "0.9rem" }}>
            {plato.descripcion && plato.descripcion.length > 105
              ? `${plato.descripcion.slice(0, 102)}...`
              : plato.descripcion || "Plato típico tradicional de Cochabamba."}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid var(--color-border-light)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 700,
                color: "var(--color-primary-dark)",
                fontSize: "1.02rem",
                whiteSpace: "nowrap",
              }}
            >
              {precio}
            </span>
            {plato.provincia && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  color: "var(--color-muted)",
                  fontSize: "0.76rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <MapPin size={12} style={{ flexShrink: 0 }} /> {plato.provincia.nombre}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
