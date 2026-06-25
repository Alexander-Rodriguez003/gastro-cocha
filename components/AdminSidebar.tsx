"use client";
import Link from "next/link";
import { LayoutDashboard, Utensils, MapPin, MessageSquare, Bell, ChevronLeft, Key } from "lucide-react";

export function AdminSidebar({ userName }: { userName: string }) {
  return (
    <>
      <aside
        style={{
          width: 220,
          background: "var(--color-bg-card)",
          color: "var(--color-text)",
          padding: "1.5rem 0",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
          flexShrink: 0,
        }}
        className="admin-sidebar"
      >
        <div style={{ padding: "0 1rem 1rem", borderBottom: "1px solid var(--color-border)", marginBottom: "0.5rem" }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>
            Panel Admin
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 2 }}>
            {userName}
          </div>
        </div>

        <SidebarLink href="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <SidebarLink href="/admin/platos" icon={<Utensils size={18} />} label="Platos" />
        <SidebarLink href="/admin/lugares" icon={<MapPin size={18} />} label="Lugares" />
        <SidebarLink href="/admin/solicitudes" icon={<Bell size={18} />} label="Solicitudes" />
        <SidebarLink href="/admin/resenas" icon={<MessageSquare size={18} />} label="Reseñas" />
        <SidebarLink href="/admin/propietarios" icon={<Key size={18} />} label="Propietarios" />

        <div style={{ flex: 1 }} />
        <div style={{ padding: "1rem", borderTop: "1px solid var(--color-border)" }}>
          <Link href="/" style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            <ChevronLeft size={14} /> Volver al sitio
          </Link>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { display: none !important; }
        }
      `}</style>
    </>
  );
}

function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      style={{
        padding: "0.6rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        color: "var(--color-text-muted)",
        textDecoration: "none",
        fontSize: "0.85rem",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-border)"; e.currentTarget.style.color = "var(--color-primary)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
    >
      {icon}
      {label}
    </Link>
  );
}
