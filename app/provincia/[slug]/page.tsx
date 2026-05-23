import { getProvinciaDetail } from "@/lib/data";
import { PlatoCard } from "@/components/PlatoCard";
import { MapPin, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProvinciaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProvinciaDetail(slug);
  if (!data) notFound();

  const { provincia, platos } = data;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Breadcrumb */}
      <Link href="/provincias" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Todas las provincias
      </Link>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <MapPin size={22} color="var(--color-secondary)" />
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem" }}>
            {provincia.nombre}
          </h1>
        </div>
        {provincia.descripcion && (
          <p style={{ color: "var(--color-text-muted)", fontSize: "1rem", lineHeight: 1.6, maxWidth: 600 }}>
            {provincia.descripcion}
          </p>
        )}
      </div>

      {/* Platos grid */}
      {platos.length > 0 ? (
        <>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.2rem", marginBottom: "1rem" }}>
            Platos típicos de {provincia.nombre} ({platos.length})
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {platos.map(plato => (
              <PlatoCard key={plato.id} plato={{ ...plato, provincia }} />
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
          <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Aún no hay platos registrados para esta provincia.</p>
          <p style={{ fontSize: "0.9rem" }}>¡Pronto agregaremos más contenido! 🍽️</p>
        </div>
      )}
    </div>
  );
}
