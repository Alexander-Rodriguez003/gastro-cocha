import type { Metadata } from "next";
import { getRankingGlobal, getTrendingGlobal } from "@/lib/data";
import { PlatoCard } from "@/components/PlatoCard";
import { Trophy, Flame } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ranking Gastronómico",
  description: "Los platos típicos y especialidades mejor calificados y en tendencia de Cochabamba.",
};

interface Props {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function RankingPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const activeTab = tab === "trending" ? "trending" : "general";

  const platos = activeTab === "trending" 
    ? await getTrendingGlobal() 
    : await getRankingGlobal();

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "clamp(1.85rem, 4vw, 2.5rem)", display: "flex", alignItems: "center", gap: 10, color: "var(--color-ink)" }}>
            <Trophy size={28} color="var(--color-amber)" /> Ranking Gastronómico
          </h1>
          <p style={{ color: "var(--color-muted)", marginTop: "0.35rem", fontSize: "0.95rem" }}>
            {activeTab === "trending"
              ? "Platos y especialidades con mayor movimiento y recomendados recientemente"
              : "Los platos mejor calificados de todo Cochabamba de manera histórica"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: "2rem" }}>
        <Link
          href="/ranking?tab=general"
          className={`tab-btn ${activeTab === "general" ? "tab-btn-active" : ""}`}
        >
          <Trophy size={15} /> Historial de Oro
        </Link>
        <Link
          href="/ranking?tab=trending"
          className={`tab-btn ${activeTab === "trending" ? "tab-btn-active" : ""}`}
        >
          <Flame size={15} fill={activeTab === "trending" ? "var(--color-amber)" : "none"} /> En Tendencia
        </Link>
      </div>

      {platos.length === 0 ? (
        <div style={{ padding: "4rem 2rem", textAlign: "center", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-lg)", color: "var(--color-muted)" }}>
          No hay platos que cumplan esta condición en este momento.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {platos.map((plato, i) => (
            <div key={plato.id} style={{ position: "relative" }}>
              {/* Rank badges only in historic view */}
              {activeTab === "general" && i < 3 && (
                <div style={{
                  position: "absolute", top: 12, left: 12, zIndex: 3,
                  width: 30, height: 30, borderRadius: "50%",
                  background: i === 0 ? "#B78103" : i === 1 ? "#6B7280" : "#9A4D1E",
                  border: "2px solid #FFFFFF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: "0.8rem", color: "#FFFFFF",
                  boxShadow: "var(--shadow-md)",
                }}>
                  {i + 1}
                </div>
              )}
              {/* Hot score flame badge in trending view */}
              {activeTab === "trending" && (
                <div style={{
                  position: "absolute", top: 12, left: 12, zIndex: 3,
                  background: "rgba(26, 23, 20, 0.85)", backdropFilter: "blur(4px)",
                  color: "#FFFFFF", padding: "0.25rem 0.6rem", borderRadius: "var(--radius-pill)",
                  fontSize: "0.7rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4
                }}>
                  <Flame size={12} fill="var(--color-amber)" color="var(--color-amber)" /> {plato.hot_score > 0 ? `${plato.hot_score.toFixed(0)} pts` : "Nuevo"}
                </div>
              )}
              <PlatoCard plato={plato} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
