"use client";

import { useState, useEffect } from "react";
import { PlatoCard } from "@/components/PlatoCard";
import { Sparkles, RefreshCw } from "lucide-react";
import type { Plato } from "@/lib/types";

export function FeaturedPlatos({ initialPlatos }: { initialPlatos: Plato[] }) {
  const [maxPrice, setMaxPrice] = useState<number>(Infinity);
  const [filteredPlatos, setFilteredPlatos] = useState<Plato[]>(initialPlatos);

  // Listen for AI Agent dynamic filtering action
  useEffect(() => {
    const handleAiAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      const data = customEvent.detail;
      if (!data) return;

      if (data.action === "filter_list" && typeof data.max_price === "number") {
        setMaxPrice(data.max_price);
      }
    };

    window.addEventListener("gastro_action", handleAiAction);
    return () => {
      window.removeEventListener("gastro_action", handleAiAction);
    };
  }, []);

  // Update dynamic list when maxPrice changes
  useEffect(() => {
    if (maxPrice === Infinity) {
      setFilteredPlatos(initialPlatos);
    } else {
      setFilteredPlatos(
        initialPlatos.filter((p) => (p.precio_referencial ?? 0) <= maxPrice)
      );
    }
  }, [maxPrice, initialPlatos]);

  return (
    <div>
      {/* Dynamic Filter Status Toast (Neon glowing badge) */}
      {maxPrice !== Infinity && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(16,185,129,0.1))",
            border: "1px solid #10B981",
            boxShadow: "0 0 15px rgba(16,185,129,0.15)",
            padding: "0.6rem 1.0rem",
            borderRadius: 12,
            marginBottom: "1.25rem",
            animation: "filterToastIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", fontWeight: 600 }}>
            <Sparkles size={16} color="#10B981" />
            <span>Filtro de IA activo: Platos de hasta <strong style={{ color: "#10B981" }}>{maxPrice} Bs</strong></span>
          </div>
          <button
            onClick={() => setMaxPrice(Infinity)}
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#047857",
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.3rem 0.65rem",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <RefreshCw size={12} /> Reestablecer
          </button>
        </div>
      )}

      {/* Grid rendering */}
      {filteredPlatos.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.25rem",
            animation: "gridPulseFade 0.4s ease",
          }}
        >
          {filteredPlatos.map((plato) => (
            <div
              key={plato.id}
              style={{
                animation: "cardItemZoomIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <PlatoCard plato={plato} />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            background: "rgba(28, 25, 23, 0.02)",
            border: "1px dashed rgba(28, 25, 23, 0.12)",
            borderRadius: 16,
            color: "var(--color-text-muted)",
          }}
        >
          No hay platos destacados menores a {maxPrice} Bs registrados en esta sección.
        </div>
      )}

      {/* Rhythmic Game-like Keyframes */}
      <style>{`
        @keyframes filterToastIn {
          0% { transform: translateY(-10px) scale(0.95); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes cardItemZoomIn {
          from { transform: scale(0.9) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes gridPulseFade {
          from { opacity: 0.6; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
