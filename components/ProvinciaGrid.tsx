import React from "react";
import Link from "next/link";
import type { Provincia } from "@/lib/types";
import { ChevronRight } from "lucide-react";

// ── Province color palettes (editorial accent colors) ──────────────────────
const PROVINCE_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  cercado:        { bg: "#F3E8D8", accent: "#C8702A", text: "#7A3D10" },
  quillacollo:    { bg: "#E8F0E8", accent: "#2A5C3F", text: "#1A3D28" },
  chapare:        { bg: "#E0F4EC", accent: "#0F7B55", text: "#095C3D" },
  punata:         { bg: "#FEF3E2", accent: "#D4860A", text: "#8A5500" },
  "german-jordan":{ bg: "#F0EAF8", accent: "#6B3DAA", text: "#421D72" },
  "esteban-arce": { bg: "#FDE8E8", accent: "#C0312A", text: "#7A1A14" },
  arani:          { bg: "#FFF3E0", accent: "#D4700A", text: "#8A4400" },
  carrasco:       { bg: "#E8F4F8", accent: "#1A7FA0", text: "#0D5570" },
  mizque:         { bg: "#FFF0E8", accent: "#C85A1A", text: "#803010" },
  capinota:       { bg: "#FFFBE6", accent: "#B89A00", text: "#7A6500" },
  campero:        { bg: "#F8EAF8", accent: "#9A3DAA", text: "#621D72" },
  ayopaya:        { bg: "#EEF0F8", accent: "#3D5CAA", text: "#1D3272" },
  arque:          { bg: "#F0F8E8", accent: "#4A7A20", text: "#2A5000" },
  tapacari:       { bg: "#EDF4FF", accent: "#2A5CA8", text: "#1A3C78" },
  bolivar:        { bg: "#FFF0EC", accent: "#C04A28", text: "#7A2810" },
  tiraque:        { bg: "#E0F8F8", accent: "#0A8A8A", text: "#055858" },
};

// ── SVG icons, one per province — all inline, no emoji ──────────────────────
function ProvinceIcon({ slug, color }: { slug: string; color: string }) {
  const icons: Record<string, React.ReactElement> = {
    cercado: (
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
        <rect x="4" y="14" width="24" height="14" rx="1" stroke={color} strokeWidth="1.5"/>
        <path d="M2 14 L16 4 L30 14" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="12" y="20" width="8" height="8" rx="1" stroke={color} strokeWidth="1.5"/>
        <line x1="16" y1="20" x2="16" y2="28" stroke={color} strokeWidth="1.5"/>
      </svg>
    ),
    quillacollo: (
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
        <path d="M16 4 C16 4 8 10 8 20 C8 25 11 28 16 28 C21 28 24 25 24 20 C24 10 16 4 16 4Z" stroke={color} strokeWidth="1.5"/>
        <path d="M12 28 L12 22 Q16 19 20 22 L20 28" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 16 Q13 14 16 16 Q19 14 22 16" stroke={color} strokeWidth="1.2"/>
      </svg>
    ),
    chapare: (
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
        <path d="M16 28 L16 12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 18 Q10 14 8 8 Q14 8 16 14" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M16 14 Q22 10 24 4 Q18 5 16 12" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 28 C10 25 14 24 16 28 C18 24 22 25 24 28" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    punata: (
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
        <ellipse cx="16" cy="16" rx="10" ry="7" stroke={color} strokeWidth="1.5"/>
        <path d="M16 9 C16 9 18 6 22 7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 16 Q10 20 16 22 Q22 20 24 16" stroke={color} strokeWidth="1.2"/>
        <circle cx="16" cy="16" r="2.5" stroke={color} strokeWidth="1.2"/>
      </svg>
    ),
    "german-jordan": (
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
        <path d="M16 6 L18 12 L24 12 L19 16 L21 22 L16 18 L11 22 L13 16 L8 12 L14 12 Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="16" cy="26" r="2" stroke={color} strokeWidth="1.2"/>
      </svg>
    ),
    "esteban-arce": (
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
        <path d="M10 26 C10 18 13 12 16 8 C19 12 22 18 22 26" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <ellipse cx="16" cy="8" rx="3" ry="4" stroke={color} strokeWidth="1.5"/>
        <path d="M8 22 Q12 20 16 22 Q20 20 24 22" stroke={color} strokeWidth="1.2"/>
      </svg>
    ),
    arani: (
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
        <path d="M6 20 Q6 12 16 10 Q26 12 26 20 L26 24 Q16 28 6 24 Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 10 Q16 6 22 10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="11" y1="18" x2="21" y2="18" stroke={color} strokeWidth="1.2"/>
      </svg>
    ),
    carrasco: (
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
        <path d="M4 24 L12 10 L16 16 L20 8 L28 24 Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M4 24 L28 24" stroke={color} strokeWidth="1.5"/>
        <path d="M14 24 L14 20 Q16 18 18 20 L18 24" stroke={color} strokeWidth="1.2"/>
      </svg>
    ),
    mizque: (
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
        <path d="M6 22 Q6 12 16 8 Q26 12 26 22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M6 22 Q16 28 26 22" stroke={color} strokeWidth="1.5"/>
        <circle cx="16" cy="17" r="4" stroke={color} strokeWidth="1.2"/>
        <path d="M12 22 Q14 20 16 22 Q18 20 20 22" stroke={color} strokeWidth="1.2"/>
      </svg>
    ),
    capinota: (
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
        <rect x="9" y="10" width="14" height="16" rx="7" stroke={color} strokeWidth="1.5"/>
        <path d="M9 17 L23 17" stroke={color} strokeWidth="1.2"/>
        <path d="M13 6 Q16 4 19 6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="13" y="6" width="6" height="4" rx="1" stroke={color} strokeWidth="1.2"/>
      </svg>
    ),
    campero: (
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
        <ellipse cx="16" cy="20" rx="5" ry="7" stroke={color} strokeWidth="1.5"/>
        <path d="M16 13 L16 5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M13 7 Q16 5 19 7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M11 20 L5 23" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M21 20 L27 23" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <ellipse cx="16" cy="26" rx="3" ry="1.5" stroke={color} strokeWidth="1.2"/>
      </svg>
    ),
    ayopaya: (
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
        <path d="M4 26 L10 12 L16 20 L22 8 L28 26 Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M4 26 L28 26" stroke={color} strokeWidth="1.5"/>
        <path d="M22 8 Q24 6 26 8" stroke={color} strokeWidth="1.2"/>
      </svg>
    ),
    arque: (
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
        <path d="M16 6 L16 16 M14 10 L12 6 M18 10 L20 6 M12 14 L8 12 M20 14 L24 12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <ellipse cx="16" cy="20" rx="7" ry="5" stroke={color} strokeWidth="1.5"/>
        <path d="M9 22 Q16 28 23 22" stroke={color} strokeWidth="1.2"/>
      </svg>
    ),
    tapacari: (
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
        <rect x="6" y="16" width="20" height="10" rx="2" stroke={color} strokeWidth="1.5"/>
        <path d="M8 16 Q10 8 16 6 Q22 8 24 16" stroke={color} strokeWidth="1.5"/>
        <path d="M10 22 L22 22" stroke={color} strokeWidth="1.2"/>
        <circle cx="16" cy="20" r="2" stroke={color} strokeWidth="1.2"/>
      </svg>
    ),
    bolivar: (
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
        <path d="M10 28 L10 10 Q10 6 16 6 Q22 6 22 10 L22 28" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 17 Q16 20 22 17" stroke={color} strokeWidth="1.2"/>
        <path d="M10 10 Q16 13 22 10" stroke={color} strokeWidth="1.2"/>
        <path d="M8 28 L24 28" stroke={color} strokeWidth="1.5"/>
      </svg>
    ),
    tiraque: (
      <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
        <path d="M6 18 Q10 12 16 14 Q22 12 26 18 Q22 24 16 22 Q10 24 6 18Z" stroke={color} strokeWidth="1.5"/>
        <circle cx="22" cy="16" r="1.5" fill={color}/>
        <path d="M6 18 L3 18 M26 18 L29 18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 22 L14 27 L16 26 L18 27 Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
    ),
  };
  return icons[slug] || (
    <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
      <circle cx="16" cy="16" r="10" stroke={color} strokeWidth="1.5"/>
      <path d="M16 10 L16 22 M10 16 L22 16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface ProvinciaGridProps {
  provincias: Provincia[];
  limit?: number; // if set, show only this many cards
}

export function ProvinciaGrid({ provincias, limit }: ProvinciaGridProps) {
  const displayed = limit ? provincias.slice(0, limit) : provincias;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "1px",
        background: "var(--color-border)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      {displayed.map((prov) => {
        const palette = PROVINCE_COLORS[prov.slug] ?? {
          bg: "#F7F4EE",
          accent: "#C8702A",
          text: "#7A3D10",
        };
        return (
          <Link
            key={prov.id}
            href={`/provincia/${prov.slug}`}
            style={{ textDecoration: "none", color: "inherit", display: "block" }}
          >
            <div
              className="provincia-card"
              style={{
                background: "var(--color-bg-card)",
                padding: "1.5rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                cursor: "pointer",
                transition: "background 0.2s",
                height: "100%",
              }}
            >
              {/* Icon box */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: "var(--radius-md)",
                  background: palette.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "9px",
                }}
              >
                <ProvinceIcon slug={prov.slug} color={palette.accent} />
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--color-ink)",
                    lineHeight: 1.2,
                    marginBottom: "0.3rem",
                  }}
                >
                  {prov.nombre}
                </div>
                {prov.descripcion && (
                  <div
                    style={{
                      color: "var(--color-muted)",
                      fontSize: "0.75rem",
                      lineHeight: 1.45,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical" as const,
                    }}
                  >
                    {prov.descripcion}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight
                size={14}
                style={{ flexShrink: 0, color: "var(--color-muted)", opacity: 0.5 }}
              />
            </div>
          </Link>
        );
      })}

      <style>{`
        .provincia-card:hover {
          background: var(--color-cream) !important;
        }
        .provincia-card:hover svg {
          transform: scale(1.08);
          transition: transform 0.2s;
        }
      `}</style>
    </div>
  );
}
