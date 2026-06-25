"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, LogIn, LogOut, User } from "lucide-react";

interface UserInfo { name: string; email: string; role: string; }

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setUser(d.user)).catch(() => {});
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  const navStyle: React.CSSProperties = {
    viewTransitionName: "site-header" as never,
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(247,244,238,0.97)",
    backdropFilter: "blur(10px)",
    borderBottom: `1px solid ${scrolled ? "var(--color-border)" : "transparent"}`,
    transition: "border-color 0.3s",
  };

  return (
    <header style={navStyle}>
      <nav style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "baseline", gap: "0.1rem", textDecoration: "none" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "1.35rem", color: "var(--color-ink)", letterSpacing: "-0.01em" }}>
            Gastro
          </span>
          <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontStyle: "italic", fontSize: "1.35rem", color: "var(--color-amber)", letterSpacing: "-0.01em" }}>
            Cocha
          </span>
        </Link>

        {/* Desktop */}
        <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <NavLink href="/provincias">Provincias</NavLink>
          <NavLink href="/ranking">Ranking</NavLink>
          <NavLink href="/negocios">Negocios</NavLink>
          <NavLink href="/registrar-negocio">Registrar</NavLink>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              {user.role === "admin" && (
                <Link href="/admin" style={{ fontSize: "0.8rem", fontWeight: 600, padding: "0.35rem 0.9rem", borderRadius: "var(--radius-pill)", background: "var(--color-ink)", color: "var(--color-cream)", textDecoration: "none" }}>Admin</Link>
              )}
              {user.role === "owner" && (
                <Link href="/owner" style={{ fontSize: "0.8rem", fontWeight: 600, padding: "0.35rem 0.9rem", borderRadius: "var(--radius-pill)", background: "var(--color-forest)", color: "var(--color-forest-text)", textDecoration: "none" }}>Mi Negocio</Link>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.82rem", color: "var(--color-muted)", fontWeight: 500 }}>
                <User size={13} />{user.name.split(" ")[0]}
              </span>
              <button onClick={handleLogout} style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-pill)", padding: "0.35rem 0.75rem", cursor: "pointer", fontSize: "0.78rem", color: "var(--color-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1.25rem", borderRadius: "var(--radius-pill)", background: "var(--color-ink)", color: "var(--color-cream)", textDecoration: "none", fontSize: "0.83rem", fontWeight: 500 }}>
              <LogIn size={14} />Ingresar
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="nav-mobile-toggle" onClick={() => setOpen(!open)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "var(--color-ink)" }} aria-label="Menú">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div style={{ borderTop: "1px solid var(--color-border)", padding: "1.25rem 2rem", display: "flex", flexDirection: "column", gap: "1rem", background: "var(--color-cream)" }}>
          {["Provincias:/provincias","Ranking:/ranking","Negocios:/negocios","Registrar:/registrar-negocio"].map(item => {
            const [label, href] = item.split(":");
            return <Link key={href} href={href} onClick={() => setOpen(false)} style={{ color: "var(--color-ink)", textDecoration: "none", fontWeight: 500, fontSize: "1rem", paddingBottom: "0.6rem", borderBottom: "1px solid var(--color-border-light)" }}>{label}</Link>;
          })}
          {user ? (
            <>
              {user.role === "admin" && <Link href="/admin" onClick={() => setOpen(false)} style={{ color: "var(--color-ink)", textDecoration: "none", fontWeight: 500 }}>Panel Admin</Link>}
              {user.role === "owner" && <Link href="/owner" onClick={() => setOpen(false)} style={{ color: "var(--color-ink)", textDecoration: "none", fontWeight: 500 }}>Mi Negocio</Link>}
              <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", color: "var(--color-muted)", fontSize: "0.9rem", padding: 0 }}>Cerrar sesión</button>
            </>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} style={{ padding: "0.7rem", borderRadius: "var(--radius-pill)", textAlign: "center", background: "var(--color-ink)", color: "var(--color-cream)", textDecoration: "none", fontWeight: 500 }}>Ingresar</Link>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) { .nav-mobile-toggle { display: none !important; } .nav-desktop { display: flex !important; } }
        @media (max-width: 767px) { .nav-mobile-toggle { display: block !important; } .nav-desktop { display: none !important; } }
      `}</style>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
      style={{ color: "var(--color-muted)", textDecoration: "none", fontWeight: 500, fontSize: "0.875rem", transition: "color 0.2s" }}
      onMouseEnter={e => (e.currentTarget.style.color = "var(--color-ink)")}
      onMouseLeave={e => (e.currentTarget.style.color = "var(--color-muted)")}
    >{children}</Link>
  );
}
