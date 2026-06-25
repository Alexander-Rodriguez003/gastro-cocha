import { getRankingGlobal, getTrendingGlobal } from "@/lib/data";
import { PlatoCard } from "@/components/PlatoCard";
import { Trophy, Flame } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

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
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", display: "flex", alignItems: "center", gap: 8 }}>
            <Trophy size={28} color="var(--color-primary)" /> Ranking Gastronómico
          </h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            {activeTab === "trending"
              ? "Platos y especialidades con mayor movimiento y recomendados recientemente"
              : "Los platos mejor calificados de todo Cochabamba de manera histórica"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--color-border)", marginBottom: "2rem" }}>
        <Link
          href="/ranking?tab=general"
          style={{
            padding: "0.75rem 1.25rem", textDecoration: "none",
            fontWeight: 600, fontSize: "0.9rem",
            color: activeTab === "general" ? "var(--color-primary)" : "var(--color-text-muted)",
            borderBottom: activeTab === "general" ? "2px solid var(--color-primary)" : "none",
            transition: "all 0.2s"
          }}
        >
          🏆 Historial de Oro
        </Link>
        <Link
          href="/ranking?tab=trending"
          style={{
            padding: "0.75rem 1.25rem", textDecoration: "none",
            fontWeight: 600, fontSize: "0.9rem",
            color: activeTab === "trending" ? "var(--color-primary)" : "var(--color-text-muted)",
            borderBottom: activeTab === "trending" ? "2px solid var(--color-primary)" : "none",
            transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: 4
          }}
        >
          <Flame size={16} fill={activeTab === "trending" ? "var(--color-primary)" : "none"} /> En Tendencia
        </Link>
      </div>

      {platos.length === 0 ? (
        <div style={{ padding: "4rem 2rem", textAlign: "center", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-lg)", color: "var(--color-text-muted)" }}>
          No hay platos que cumplan esta condición en este momento.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {platos.map((plato, i) => (
            <div key={plato.id} style={{ position: "relative" }}>
              {/* Rank badges only in historic view */}
              {activeTab === "general" && i < 3 && (
                <div style={{
                  position: "absolute", top: -8, left: -8, zIndex: 2,
                  width: 32, height: 32, borderRadius: "50%",
                  background: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : "#CD7F32",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: "0.85rem", color: "#fff",
                  boxShadow: "var(--shadow-md)",
                }}>
                  {i + 1}
                </div>
              )}
              {/* Hot score flame badge in trending view */}
              {activeTab === "trending" && (
                <div style={{
                  position: "absolute", top: 12, left: 12, zIndex: 2,
                  background: "rgba(239, 68, 68, 0.9)", backdropFilter: "blur(4px)",
                  color: "white", padding: "0.25rem 0.5rem", borderRadius: "6px",
                  fontSize: "0.7rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 3
                }}>
                  <Flame size={12} fill="white" /> {plato.hot_score > 0 ? `${plato.hot_score.toFixed(0)} pts` : "Nuevo"}
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
