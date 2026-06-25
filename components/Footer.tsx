"use client";
import Link from "next/link";
import { MapPin, Heart, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer>
      {/* ── Checkered stripe ── */}
      <div className="checkered-border" aria-hidden="true" />

      {/* ── Main dark body ── */}
      <div style={{ background: "var(--color-bg-dark)", color: "var(--color-cream)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "4rem 2rem 2.5rem" }}>

          {/* Top: logo + cols */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "3rem", alignItems: "start", marginBottom: "3.5rem" }} className="footer-grid">
            {/* Brand */}
            <div>
              <p style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 1, letterSpacing: "-0.02em", color: "var(--color-cream)", marginBottom: "1rem" }}>
                GASTRO<br />
                <span style={{ fontStyle: "italic", color: "var(--color-amber)" }}>COCHA</span>
              </p>
              <p style={{ color: "rgba(247,244,238,0.5)", fontSize: "0.83rem", lineHeight: 1.6, maxWidth: 260 }}>
                La guía gastronómica más completa de las 16 provincias de Cochabamba, Bolivia.
              </p>
            </div>

            {/* Nav links */}
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(247,244,238,0.4)", marginBottom: "1rem" }}>
                Explorar
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                <FooterLink href="/provincias">Provincias</FooterLink>
                <FooterLink href="/ranking">Ranking</FooterLink>
                <FooterLink href="/negocios">Negocios</FooterLink>
                <FooterLink href="/registrar-negocio">Registrar</FooterLink>
              </div>
            </div>

            {/* Acciones */}
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(247,244,238,0.4)", marginBottom: "1rem" }}>
                Acciones
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                <FooterLink href="/login">Ingresar</FooterLink>
                <FooterLink href="/registrar-negocio">Añadir negocio</FooterLink>
                <FooterLink href="/ranking">Ver ranking</FooterLink>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: "1px solid rgba(247,244,238,0.1)", paddingTop: "1.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <p style={{ color: "rgba(247,244,238,0.35)", fontSize: "0.78rem" }}>
              © {new Date().getFullYear()} GastroCocha — Cochabamba, Bolivia
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <FooterLink href="/provincias">FAQ</FooterLink>
              <FooterLink href="/ranking">Actualizaciones</FooterLink>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .footer-grid {
          grid-template-columns: 1fr auto auto;
        }
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 2rem !important;
          }
          .footer-grid > div:first-child {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{ color: "rgba(247,244,238,0.65)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 400, transition: "color 0.2s", display: "flex", alignItems: "center", gap: "0.25rem" }}
      onMouseEnter={e => (e.currentTarget.style.color = "var(--color-cream)")}
      onMouseLeave={e => (e.currentTarget.style.color = "rgba(247,244,238,0.65)")}
    >
      {children}
    </Link>
  );
}
