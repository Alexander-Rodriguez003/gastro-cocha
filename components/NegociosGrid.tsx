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
            fontFamily: "Georgia, serif", 
            fontWeight: 700, 
            fontSize: "2.25rem", 
            letterSpacing: "-0.02em",
            marginBottom: "0.5rem"
          }}
        >
          Negocios y Restaurantes Gastronómicos
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "1rem" }}>
          Explora los rincones culinarios más famosos y tradicionales de Cochabamba
        </p>
      </div>

      {/* SEARCH AND FILTER BAR (Premium cyber style) */}
      <div 
        style={{ 
          background: "color-mix(in srgb, var(--color-bg-card) 70%, transparent)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--color-border)",
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
          <Search size={18} color="var(--color-text-muted)" style={{ position: "absolute", left: 16 }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, dirección o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.85rem 1rem 0.85rem 2.75rem",
              borderRadius: 14,
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-card)",
              fontSize: "0.95rem",
              fontFamily: "inherit",
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
          />
        </div>

        {/* Province Filter Pills */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: "0.25rem" }}>
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
                border: selectedProvince === prov ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
                background: selectedProvince === prov ? "rgba(217, 119, 6, 0.08)" : "var(--color-bg-card)",
                color: selectedProvince === prov ? "var(--color-primary)" : "var(--color-text-muted)",
                transition: "all 0.2s ease",
              }}
            >
              {prov === "all" ? "Todas" : prov}
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
                border: "1px solid var(--color-border)",
                padding: "1.5rem",
                background: "var(--color-bg-card)",
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
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "var(--color-primary)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.02)";
              }}
            >
              <div>
                
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1.25rem", color: "var(--color-text)", lineHeight: 1.25 }}>
                    {lugar.nombre}
                  </h2>
                  {lugar.provincia && (
                    <span 
                      style={{ 
                        background: "var(--color-surface-green)", 
                        border: "1px solid rgba(5, 150, 105, 0.15)",
                        color: "var(--color-secondary-dark)",
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
                  background: "rgba(5, 150, 105, 0.05)",
                  border: "1px solid rgba(5, 150, 105, 0.15)",
                  color: "var(--color-secondary-dark)",
                  padding: "0.6rem 1rem",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  textAlign: "center"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-secondary)";
                  e.currentTarget.style.color = "#FFFFFF";
                  e.currentTarget.style.borderColor = "var(--color-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(5, 150, 105, 0.05)";
                  e.currentTarget.style.color = "var(--color-secondary-dark)";
                  e.currentTarget.style.borderColor = "rgba(5, 150, 105, 0.15)";
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
