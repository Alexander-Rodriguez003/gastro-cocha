"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { PLATOS } from "@/lib/seed-data";

interface PlatoRow {
  nombre: string;
  slug: string;
  provincia_slug: string;
  precio_referencial: number;
  destacado: boolean;
  activo: boolean;
}

export default function AdminPlatosPage() {
  const [search, setSearch] = useState("");
  const [platos, setPlatos] = useState<PlatoRow[]>(
    PLATOS.map((p) => ({
      nombre: p.nombre,
      slug: p.slug,
      provincia_slug: p.provincia_slug,
      precio_referencial: p.precio_referencial,
      destacado: p.destacado,
      activo: true,
    }))
  );

  const filtered = platos.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActivo = (slug: string) => {
    setPlatos((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, activo: !p.activo } : p))
    );
  };

  const toggleDestacado = (slug: string) => {
    setPlatos((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, destacado: !p.destacado } : p))
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 4, color: "#78716C", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Panel Admin
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "1.75rem" }}>
          🍽️ Gestionar Platos ({filtered.length})
        </h1>
        <button className="btn-primary" style={{ fontSize: "0.85rem" }}>
          <Plus size={16} /> Nuevo Plato
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#78716C" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar platos..."
          style={{
            width: "100%", padding: "0.65rem 0.9rem 0.65rem 2.5rem", borderRadius: 12,
            border: "1px solid #E7E5E4", background: "#FFFBF5", fontSize: "0.9rem", outline: "none",
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E7E5E4", textAlign: "left" }}>
              <th style={{ padding: "0.75rem 0.5rem", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Plato</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Provincia</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Precio</th>
              <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>Destacado</th>
              <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>Activo</th>
              <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((plato) => (
              <tr key={plato.slug} style={{ borderBottom: "1px solid #E7E5E4" }}>
                <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>
                  <Link href={`/plato/${plato.slug}`} style={{ color: "#D97706", textDecoration: "none" }}>
                    {plato.nombre}
                  </Link>
                </td>
                <td style={{ padding: "0.75rem 0.5rem", color: "#78716C" }}>{plato.provincia_slug}</td>
                <td style={{ padding: "0.75rem 0.5rem" }}>{plato.precio_referencial} Bs</td>
                <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                  <button onClick={() => toggleDestacado(plato.slug)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>
                    {plato.destacado ? "⭐" : "☆"}
                  </button>
                </td>
                <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                  <button onClick={() => toggleActivo(plato.slug)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    {plato.activo ? <Eye size={18} color="#059669" /> : <EyeOff size={18} color="#78716C" />}
                  </button>
                </td>
                <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                  <button style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <Edit size={16} color="#D97706" />
                  </button>
                  <button style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <Trash2 size={16} color="#EF4444" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
