"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search, MapPin, Eye, EyeOff, ExternalLink } from "lucide-react";
import { LUGARES } from "@/lib/seed-data";

interface LugarRow {
  nombre: string;
  slug: string;
  provincia_slug: string;
  direccion: string;
  telefono: string;
  lat: number;
  lng: number;
  activo: boolean;
  aprobado: boolean;
}

export default function AdminLugaresPage() {
  const [search, setSearch] = useState("");
  const [lugares, setLugares] = useState<LugarRow[]>(
    LUGARES.map((l) => ({
      nombre: l.nombre,
      slug: l.slug,
      provincia_slug: l.provincia_slug,
      direccion: l.direccion,
      telefono: l.telefono,
      lat: l.lat,
      lng: l.lng,
      activo: l.activo,
      aprobado: l.aprobado,
    }))
  );

  const filtered = lugares.filter((l) =>
    l.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActivo = (slug: string) => {
    setLugares((prev) =>
      prev.map((l) => (l.slug === slug ? { ...l, activo: !l.activo } : l))
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 4, color: "#78716C", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Panel Admin
      </Link>

      <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "1.75rem", marginBottom: "1.5rem" }}>
        📍 Gestionar Lugares ({filtered.length})
      </h1>

      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#78716C" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar restaurantes..."
          style={{ width: "100%", padding: "0.65rem 0.9rem 0.65rem 2.5rem", borderRadius: 12, border: "1px solid #E7E5E4", background: "#FFFBF5", fontSize: "0.9rem", outline: "none" }}
        />
      </div>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {filtered.map((lugar) => (
          <div key={lugar.slug} className="card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                {lugar.nombre}
                {lugar.aprobado && (
                  <span style={{ background: "#D1FAE5", color: "#047857", padding: "2px 8px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600 }}>
                    Aprobado
                  </span>
                )}
              </div>
              <div style={{ color: "#78716C", fontSize: "0.8rem", marginTop: 2 }}>
                <MapPin size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {lugar.direccion} — {lugar.provincia_slug}
              </div>
              {lugar.telefono && (
                <div style={{ color: "#78716C", fontSize: "0.8rem" }}>📞 {lugar.telefono}</div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <a
                href={`https://www.google.com/maps?q=${lugar.lat},${lugar.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#D97706", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}
              >
                <ExternalLink size={14} /> Ver mapa
              </a>
              <button onClick={() => toggleActivo(lugar.slug)} style={{ background: "none", border: "none", cursor: "pointer" }} title={lugar.activo ? "Desactivar" : "Activar"}>
                {lugar.activo ? <Eye size={18} color="#059669" /> : <EyeOff size={18} color="#78716C" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
