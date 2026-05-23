import { getRankingGlobal } from "@/lib/data";
import { PlatoCard } from "@/components/PlatoCard";
import { Trophy } from "lucide-react";

export default async function RankingPage() {
  const platos = await getRankingGlobal();

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", display: "flex", alignItems: "center", gap: 8 }}>
          <Trophy size={28} color="var(--color-primary)" /> Ranking Gastronómico
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
          Los platos mejor calificados de todo Cochabamba
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
        {platos.map((plato, i) => (
          <div key={plato.id} style={{ position: "relative" }}>
            {i < 3 && (
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
            <PlatoCard plato={plato} />
          </div>
        ))}
      </div>
    </div>
  );
}
