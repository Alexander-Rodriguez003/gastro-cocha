"use client";
import Link from "next/link";
import { UtensilsCrossed, MapPin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer
      style={{
        background: "var(--color-bg-card)",
        borderTop: "1px solid var(--color-border)",
        padding: "3rem 1.5rem 2rem",
        marginTop: "4rem",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "2rem",
        }}
      >
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <UtensilsCrossed size={22} color="var(--color-primary)" />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem" }}>
              Gastro<span style={{ color: "var(--color-primary)" }}>Cocha</span>
            </span>
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
            La guía gastronómica más completa de las 16 provincias de Cochabamba, Bolivia.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.9rem" }}>
            Explorar
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <FooterLink href="/provincias"><MapPin size={14} /> Provincias</FooterLink>
            <FooterLink href="/ranking"><Heart size={14} /> Ranking</FooterLink>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.9rem" }}>
            ¿Tienes un restaurante?
          </h4>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
            Registra tu negocio en nuestra plataforma y llega a más clientes.
          </p>
          <Link href="/registrar-negocio" className="btn-primary" style={{ marginTop: "0.75rem", fontSize: "0.8rem", padding: "0.4rem 1rem" }}>
            Registrar mi negocio
          </Link>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: "2rem auto 0",
          paddingTop: "1.5rem",
          borderTop: "1px solid var(--color-border)",
          textAlign: "center",
          color: "var(--color-text-muted)",
          fontSize: "0.8rem",
        }}
      >
        © {new Date().getFullYear()} GastroCocha — Hecho con ❤️ en Cochabamba, Bolivia
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        color: "var(--color-text-muted)",
        textDecoration: "none",
        fontSize: "0.85rem",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        transition: "color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
    >
      {children}
    </Link>
  );
}
