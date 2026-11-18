"use client";
import { useState, useEffect } from "react";
import { LogIn, UserPlus, Eye, EyeOff, UtensilsCrossed } from "lucide-react";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          if (data.user.role === "admin") {
            window.location.href = "/admin";
          } else if (data.user.role === "owner") {
            window.location.href = "/owner";
          } else {
            window.location.href = "/";
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanEmail = form.email.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (cleanEmail !== form.email.trim()) {
      setError("El email contiene caracteres no válidos (como ñ, tildes, etc.). Usa solo caracteres ASCII.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (tab === "register" && form.name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    
    if (!emailRegex.test(cleanEmail)) {
      setError("Por favor, ingresa un correo electrónico válido (ejemplo@dominio.com).");
      return;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = tab === "login"
        ? { email: form.email.trim(), password: form.password }
        : { name: form.name.trim(), email: form.email.trim(), password: form.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error de inicio de sesión.");
        setLoading(false);
        return;
      }

      // Redirect using window.location.href to force Navbar state sync
      if (data.user?.role === "admin") {
        window.location.href = "/admin";
      } else if (data.user?.role === "owner") {
        window.location.href = "/owner";
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("Error de conexión con el servidor.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2.5rem 1.25rem" }}>
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 440,
          padding: "2.25rem 2rem",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <UtensilsCrossed size={34} color="var(--color-amber)" style={{ margin: "0 auto 0.6rem" }} />
          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "1.85rem", color: "var(--color-ink)" }}>
            Gastro<span style={{ fontStyle: "italic", color: "var(--color-amber)" }}>Cocha</span>
          </h1>
          <p style={{ color: "var(--color-muted)", fontSize: "0.88rem", marginTop: "0.25rem" }}>
            {tab === "login" ? "Inicia sesión para acceder a tu cuenta" : "Crea tu cuenta para participar en la guía"}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginBottom: "1.5rem", padding: "0.25rem", borderRadius: "var(--radius-pill)", background: "var(--color-cream)", border: "1px solid var(--color-border)" }}>
          <button
            type="button"
            onClick={() => { setTab("login"); setError(""); }}
            style={{
              padding: "0.55rem",
              borderRadius: "var(--radius-pill)",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              fontSize: "0.85rem",
              background: tab === "login" ? "var(--color-ink)" : "transparent",
              color: tab === "login" ? "var(--color-cream)" : "var(--color-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.2s ease",
            }}
          >
            <LogIn size={15} /> Ingresar
          </button>
          <button
            type="button"
            onClick={() => { setTab("register"); setError(""); }}
            style={{
              padding: "0.55rem",
              borderRadius: "var(--radius-pill)",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              fontSize: "0.85rem",
              background: tab === "register" ? "var(--color-ink)" : "transparent",
              color: tab === "register" ? "var(--color-cream)" : "var(--color-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.2s ease",
            }}
          >
            <UserPlus size={15} /> Registrarse
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {tab === "register" && (
            <div>
              <label htmlFor="login-name" style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: 5, color: "var(--color-ink-soft)" }}>Nombre</label>
              <input
                id="login-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tu nombre completo"
                required={tab === "register"}
                className="input-editorial"
              />
            </div>
          )}

          <div>
            <label htmlFor="login-email" style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: 5, color: "var(--color-ink-soft)" }}>Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com"
              required
              className="input-editorial"
            />
          </div>

          <div>
            <label htmlFor="login-password" style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: 5, color: "var(--color-ink-soft)" }}>Contraseña</label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••"
                required
                minLength={6}
                className="input-editorial"
                style={{ paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", padding: 4 }}
              >
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)", padding: "0.65rem 0.9rem", borderRadius: "var(--radius-md)", fontSize: "0.84rem", fontWeight: 500 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "0.8rem 1.5rem",
              fontSize: "0.95rem",
              marginTop: "0.25rem",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Procesando..." : tab === "login" ? "Ingresar" : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
