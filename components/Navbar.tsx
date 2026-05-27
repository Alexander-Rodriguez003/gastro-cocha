"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, UtensilsCrossed, LogIn, LogOut, User } from "lucide-react";

interface UserInfo {
  name: string;
  email: string;
  role: string;
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(12px)",
        background: "rgba(255,251,245,0.85)",
        borderBottom: "1px solid #E7E5E4",
      }}
    >
      <nav
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0.75rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", color: "#1C1917" }}>
          <UtensilsCrossed size={28} color="#D97706" />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "1.25rem" }}>
            Gastro<span style={{ color: "#D97706" }}>Cocha</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }} className="hidden-mobile">
          <NavLink href="/provincias">Provincias</NavLink>
          <NavLink href="/ranking">Ranking</NavLink>
          <NavLink href="/negocios">Negocios</NavLink>
          <NavLink href="/registrar-negocio">Registrar Negocio</NavLink>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {user.role === "admin" && (
                <Link href="/admin" style={{
                  padding: "0.4rem 0.8rem", borderRadius: 10, fontSize: "0.8rem",
                  background: "linear-gradient(135deg, #D97706, #B45309)", color: "white",
                  textDecoration: "none", fontWeight: 600, fontFamily: "'Outfit', sans-serif",
                }}>
                  Admin
                </Link>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#78716C", fontSize: "0.85rem" }}>
                <User size={16} /> {user.name.split(" ")[0]}
              </div>
              <button onClick={handleLogout} style={{
                background: "none", border: "1px solid #E7E5E4", borderRadius: 8,
                padding: "0.35rem 0.65rem", cursor: "pointer", fontSize: "0.8rem",
                color: "#78716C", display: "flex", alignItems: "center", gap: 4,
              }}>
                <LogOut size={14} /> Salir
              </button>
            </div>
          ) : (
            <Link href="/login" style={{
              padding: "0.5rem 1rem", borderRadius: 10, fontSize: "0.85rem",
              background: "linear-gradient(135deg, #D97706, #B45309)", color: "white",
              textDecoration: "none", fontWeight: 600, fontFamily: "'Outfit', sans-serif",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <LogIn size={16} /> Ingresar
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "none", color: "#1C1917" }}
          className="show-mobile"
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div style={{ padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem", borderTop: "1px solid #E7E5E4" }}>
          <NavLink href="/provincias" onClick={() => setOpen(false)}>Provincias</NavLink>
          <NavLink href="/ranking" onClick={() => setOpen(false)}>Ranking</NavLink>
          <NavLink href="/negocios" onClick={() => setOpen(false)}>Negocios</NavLink>
          <NavLink href="/registrar-negocio" onClick={() => setOpen(false)}>Registrar Negocio</NavLink>
          {user ? (
            <>
              <div style={{ fontSize: "0.85rem", color: "#78716C" }}>👤 {user.name} ({user.role})</div>
              {user.role === "admin" && <NavLink href="/admin" onClick={() => setOpen(false)}>Panel Admin</NavLink>}
              <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", color: "#EF4444", fontSize: "0.9rem", padding: 0 }}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} style={{
              padding: "0.65rem", borderRadius: 10, textAlign: "center",
              background: "linear-gradient(135deg, #D97706, #B45309)", color: "white",
              textDecoration: "none", fontWeight: 600,
            }}>
              Ingresar
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) { .show-mobile { display: none !important; } }
        @media (max-width: 767px) { .hidden-mobile { display: none !important; } .show-mobile { display: block !important; } }
      `}</style>
    </header>
  );
}

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} style={{ color: "#78716C", textDecoration: "none", fontWeight: 500, fontSize: "0.9rem", transition: "color 0.2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#D97706")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#78716C")}
    >
      {children}
    </Link>
  );
}
