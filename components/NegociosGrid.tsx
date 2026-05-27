"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Phone, ArrowRight, Building2, Compass, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Lugar } from "@/lib/types";

interface NegociosGridProps {
  initialLugares: Lugar[];
}

export function NegociosGrid({ initialLugares }: { initialLugares: Lugar[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [filteredLugares, setFilteredLugares] = useState<Lugar[]>(initialLugares);

  // Extract unique province names for filter pills
  const provinces = ["all", ...Array.from(new Set(initialLugares.map(l => l.provincia?.nombre).filter((name): name is string => !!name)))];

  // Perform dynamic search filtering
  useEffect(() => {
    let list = initialLugares;

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      list = list.filter(l => 
        l.nombre.toLowerCase().includes(term) ||
        (l.direccion && l.direccion.toLowerCase().includes(term)) ||
        (l.provincia?.nombre && l.provincia.nombre.toLowerCase().includes(term))
      );
    }

    if (selectedProvince !== "all") {
      list = list.filter(l => l.provincia?.nombre === selectedProvince);
    }

    setFilteredLugares(list);
  }, [searchTerm, selectedProvince, initialLugares]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
        <h1 
          style={{ 
            fontFamily: "var(--font-display)", 
            fontWeight: 800, 
            fontSize: "2.25rem", 
            letterSpacing: "-0.02em",
            marginBottom: "0.5rem"
          }}
        >
          🏪 Negocios y Restaurantes Gastronómicos
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "1rem" }}>
          Explora los rincones culinarios más famosos y tradicionales de Cochabamba
        </p>
      </div>

      {/* SEARCH AND FILTER BAR (Premium cyber style) */}
      <div 
        style={{ 
          background: "linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
          backdropFilter: "blur(12px)",
          border: "1px solid #E7E5E4",
          padding: "1.25rem",
          borderRadius: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          marginBottom: "2.0rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Search size={18} color="#A8A29E" style={{ position: "absolute", left: 16 }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, dirección o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.85rem 1rem 0.85rem 2.75rem",
              borderRadius: 14,
              border: "1px solid #E7E5E4",
              background: "#FFFFFF",
              fontSize: "0.95rem",
              fontFamily: "inherit",
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => e.target.style.borderColor = "#D97706"}
            onBlur={(e) => e.target.style.borderColor = "#E7E5E4"}
          />
        </div>

        {/* Province Filter Pills */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#78716C", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: "0.25rem" }}>
            Filtrar por Provincia:
          </span>
          {provinces.map((prov) => (
            <button
              key={prov}
              onClick={() => setSelectedProvince(prov)}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: 10,
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                border: selectedProvince === prov ? "1px solid #D97706" : "1px solid #E7E5E4",
                background: selectedProvince === prov ? "rgba(217, 119, 6, 0.08)" : "#FFFFFF",
                color: selectedProvince === prov ? "#D97706" : "#78716C",
                transition: "all 0.2s ease",
              }}
            >
              {prov === "all" ? "🌐 Todas" : prov}
            </button>
          ))}
        </div>
      </div>

      {/* NEGOCIOS GRID */}
      {filteredLugares.length > 0 ? (
        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
            gap: "1.5rem" 
          }}
        >
          {filteredLugares.map((lugar) => (
            <div
              key={lugar.id}
              className="card"
              style={{
                borderRadius: 20,
                border: "1px solid rgba(28, 25, 23, 0.06)",
                padding: "1.5rem",
                background: "#FFFFFF",
                boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1.25rem",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)",
                animation: "gridItemFadeIn 0.4s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px) scale(1.01)";
                e.currentTarget.style.borderColor = "#10B981";
                e.currentTarget.style.boxShadow = "0 15px 30px rgba(16, 185, 129, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.borderColor = "rgba(28, 25, 23, 0.06)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.02)";
              }}
            >
              <div>
                
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem", color: "#1C1917", lineHeight: 1.25 }}>
                    {lugar.nombre}
                  </h2>
                  {lugar.provincia && (
                    <span 
                      style={{ 
                        background: "rgba(16,185,129,0.06)", 
                        border: "1px solid rgba(16,185,129,0.12)",
                        color: "#047857",
                        padding: "0.25rem 0.6rem",
                        borderRadius: 8,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase"
                      }}
                    >
                      {lugar.provincia.nombre}
                    </span>
                  )}
                </div>

                {/* Details list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  {lugar.direccion && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Compass size={14} color="#A8A29E" style={{ flexShrink: 0 }} />
                      <span>{lugar.direccion}</span>
                    </div>
                  )}
                  {lugar.telefono && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Phone size={14} color="#A8A29E" style={{ flexShrink: 0 }} />
                      <span>{lugar.telefono}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Action Link button */}
              <Link
                href={`/negocio/${lugar.slug}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(16, 185, 129, 0.06)",
                  border: "1px solid rgba(16, 185, 129, 0.12)",
                  color: "#047857",
                  padding: "0.6rem 1rem",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  textAlign: "center"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#10B981";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(16, 185, 129, 0.06)";
                  e.currentTarget.style.color = "#047857";
                }}
              >
                <span>Visitar Landing Page</span>
                <ArrowRight size={16} />
              </Link>

            </div>
          ))}
        </div>
      ) : (
        <div 
          style={{ 
            textAlign: "center", 
            padding: "4rem 1rem", 
            background: "rgba(28, 25, 23, 0.02)",
            border: "1px dashed rgba(28, 25, 23, 0.12)",
            borderRadius: 20,
            color: "var(--color-text-muted)"
          }}
        >
          <Building2 size={36} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
          <div>No se encontraron negocios con los filtros actuales.</div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes gridItemFadeIn {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

    </div>
  );
}
