import { getAllProvincias } from "@/lib/data";
import { ProvinciaGrid } from "@/components/ProvinciaGrid";
import { MapPin } from "lucide-react";

export default async function ProvinciasPage() {
  const provincias = await getAllProvincias();

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", display: "flex", alignItems: "center", gap: 8 }}>
          <MapPin size={28} color="var(--color-secondary)" /> Provincias de Cochabamba
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
          Explora la gastronomía de las 16 provincias del departamento
        </p>
      </div>
      <ProvinciaGrid provincias={provincias} />
    </div>
  );
}
