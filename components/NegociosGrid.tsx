"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Phone, ArrowRight, Building2, Compass, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Lugar } from "@/lib/types";

interface NegociosGridProps {
  initialLugares: Lugar[];
}

export function NegociosGrid({ initialLugares }: NegociosGridProps) {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("q") || "");
  const [selectedProvince, setSelectedProvince] = useState(() => searchParams.get("provincia") || "all");

  useEffect(() => {
    const handleAiAction = (e: Event) => {
      const data = (e as CustomEvent).detail;
      if (!data || data.action !== "filter_negocios") return;
      if (typeof data.query === "string") setSearchTerm(data.query);
      if (typeof data.provincia === "string") setSelectedProvince(data.provincia || "all");
    };
    window.addEventListener("gastro_action", handleAiAction);
    return () => window.removeEventListener("gastro_action", handleAiAction);
  }, []);

  const provinces = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(initialLugares.map((l) => l.provincia?.nombre).filter((name): name is string => !!name))
      ),
    ],
    [initialLugares]
  );

  const filteredLugares = useMemo(() => {
    let list = initialLugares;
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (l) =>
          l.nombre.toLowerCase().includes(term) ||
          (l.direccion && l.direccion.toLowerCase().includes(term)) ||
          (l.provincia?.nombre && l.provincia.nombre.toLowerCase().includes(term))
      );
    }
    if (selectedProvince !== "all") {
      list = list.filter((l) => l.provincia?.nombre === selectedProvince);
    }
    return list;
  }, [searchTerm, selectedProvince, initialLugares]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <span className="badge badge-forest" style={{ marginBottom: "0.75rem" }}>
          {initialLugares.length} locales verificados
        </span>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 800,
            fontSize: "clamp(1.85rem, 4vw, 2.5rem)",
            letterSpacing: "-0.02em",
            color: "var(--color-ink)",
            marginBottom: "0.4rem",
          }}
        >
          Negocios y Restaurantes
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "0.95rem", maxWidth: 580 }}>
          Explora picanterías, comedores de carretera y restaurantes tradicionales de Cochabamba.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          padding: "1.25rem",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <label htmlFor="negocios-search" className="sr-only">
            Buscar negocio por nombre, dirección o provincia
          </label>
          <Search size={17} color="var(--color-muted)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
          <input
            id="negocios-search"
            type="text"
            placeholder="Buscar por nombre, dirección o provincia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-editorial"
            style={{ paddingLeft: "2.65rem", background: "var(--color-cream)" }}
          />
        </div>

        {/* Province Filter Pills */}
        <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: "0.3rem" }}>
            Provincia:
          </span>
          {provinces.map((prov) => {
            const active = selectedProvince === prov;
            return (
              <button
                key={prov}
                type="button"
                onClick={() => setSelectedProvince(prov)}
                style={{
                  padding: "0.38rem 0.85rem",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: active ? "1px solid var(--color-ink)" : "1px solid var(--color-border)",
                  background: active ? "var(--color-ink)" : "var(--color-cream)",
                  color: active ? "var(--color-cream)" : "var(--color-muted)",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                }}
              >
                {prov === "all" ? "Todas" : prov}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {filteredLugares.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {filteredLugares.map((lugar) => {
            const specCount = lugar.especialidades?.length ?? 0;
            return (
              <article
                key={lugar.id}
                className="card"
                style={{
                  padding: "1.4rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "1.15rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.2rem", color: "var(--color-ink)", lineHeight: 1.25 }}>
                      {lugar.nombre}
                    </h2>
                    {lugar.provincia && (
                      <span
                        className="badge badge-forest"
                        style={{ whiteSpace: "nowrap", flexShrink: 0, fontSize: "0.66rem" }}
                      >
                        {lugar.provincia.nombre}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.84rem", color: "var(--color-muted)" }}>
                    {lugar.direccion && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                        <Compass size={14} style={{ flexShrink: 0, marginTop: 3 }} />
                        <span>{lugar.direccion}</span>
                      </div>
                    )}
                    {lugar.telefono && (
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <Phone size={14} style={{ flexShrink: 0 }} />
                        <span>{lugar.telefono}</span>
                      </div>
                    )}
                    {specCount > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--color-primary-dark)", fontWeight: 600 }}>
                        <Sparkles size={14} style={{ flexShrink: 0 }} />
                        <span>{specCount} {specCount === 1 ? "especialidad propia" : "especialidades propias"}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href={`/negocio/${lugar.slug}`}
                  className="btn-secondary"
                  style={{
                    width: "100%",
                    justifyContent: "space-between",
                    padding: "0.55rem 1rem",
                    fontSize: "0.82rem",
                  }}
                >
                  <span>Ver local y menú</span>
                  <ArrowRight size={15} />
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "3.5rem 1.5rem",
            background: "var(--color-bg-card)",
            border: "1px dashed var(--color-border)",
            borderRadius: "var(--radius-lg)",
            color: "var(--color-muted)",
          }}
        >
          <Building2 size={34} style={{ margin: "0 auto 0.75rem", opacity: 0.45 }} />
          <p>No se encontraron negocios con los filtros actuales.</p>
        </div>
      )}
    </div>
  );
}
