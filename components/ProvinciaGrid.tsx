import Link from "next/link";
import type { Provincia } from "@/lib/types";
import { ChevronRight } from "lucide-react";

const EMOJI_MAP: Record<string, string> = {
  cercado: "🏙️",
  quillacollo: "⛪",
  chapare: "🌴",
  punata: "🥐",
  "german-jordan": "🕊️",
  "esteban-arce": "🌶️",
  arani: "🍞",
  carrasco: "🏔️",
  mizque: "🐷",
  capinota: "🍺",
  campero: "🎸",
  ayopaya: "⛰️",
  arque: "🌽",
  tapacari: "🥔",
  bolivar: "🏺",
  tiraque: "🐟",
};

export function ProvinciaGrid({ provincias }: { provincias: Provincia[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "1rem",
      }}
    >
      {provincias.map((prov) => (
        <Link
          key={prov.id}
          href={`/provincia/${prov.slug}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            className="card"
            style={{
              padding: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "1.75rem" }}>{EMOJI_MAP[prov.slug] || "📍"}</span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                {prov.nombre}
              </div>
              {prov.descripcion && (
                <div
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: "0.75rem",
                    marginTop: 2,
                    lineHeight: 1.4,
                  }}
                >
                  {prov.descripcion.length > 50
                    ? prov.descripcion.slice(0, 50) + "..."
                    : prov.descripcion}
                </div>
              )}
            </div>
            <ChevronRight size={16} color="var(--color-text-muted)" />
          </div>
        </Link>
      ))}
    </div>
  );
}
