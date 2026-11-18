"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Utensils, MapPin, MessageSquare, Bell, ChevronLeft, Key } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/platos", label: "Platos", icon: Utensils },
  { href: "/admin/lugares", label: "Lugares", icon: MapPin },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: Bell },
  { href: "/admin/resenas", label: "Reseñas", icon: MessageSquare },
  { href: "/admin/propietarios", label: "Propietarios", icon: Key },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile top bar */}
      <nav aria-label="Navegación admin móvil" className="admin-mobile-nav">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "0.45rem 0.75rem",
                borderRadius: "var(--radius-pill)",
                fontSize: "0.78rem",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                whiteSpace: "nowrap",
                textDecoration: "none",
                background: active ? "var(--color-ink)" : "var(--color-cream)",
                color: active ? "var(--color-cream)" : "var(--color-muted)",
                border: "1px solid var(--color-border)",
              }}
            >
              <Icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Desktop sidebar */}
      <aside
        style={{
          width: 224,
          background: "var(--color-bg-card)",
          borderRight: "1px solid var(--color-border)",
          color: "var(--color-ink)",
          padding: "1.5rem 0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
          flexShrink: 0,
        }}
        className="admin-sidebar"
      >
        <div style={{ padding: "0 0.65rem 1rem", borderBottom: "1px solid var(--color-border)", marginBottom: "0.5rem" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.05rem", color: "var(--color-ink)" }}>
            Panel Admin
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginTop: 2 }}>
            {userName}
          </div>
        </div>

        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "0.6rem 0.75rem",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                background: active ? "var(--color-amber-light)" : "transparent",
                color: active ? "var(--color-primary-dark)" : "var(--color-muted)",
                fontWeight: active ? 600 : 500,
                textDecoration: "none",
                fontSize: "0.86rem",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}

        <div style={{ flex: 1 }} />
        <div style={{ padding: "0.75rem 0.65rem 0", borderTop: "1px solid var(--color-border)" }}>
          <Link href="/" style={{ color: "var(--color-muted)", fontSize: "0.8rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            <ChevronLeft size={14} /> Volver al sitio
          </Link>
        </div>
      </aside>

      <style>{`
        .admin-mobile-nav {
          display: none;
        }
        @media (max-width: 768px) {
          .admin-sidebar { display: none !important; }
          .admin-mobile-nav {
            display: flex;
            gap: 0.45rem;
            overflow-x: auto;
            padding: 0.75rem 1rem;
            background: var(--color-bg-card);
            border-bottom: 1px solid var(--color-border);
          }
        }
      `}</style>
    </>
  );
}
