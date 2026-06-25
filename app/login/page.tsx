"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Eye, EyeOff, UtensilsCrossed } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
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

    // Client-side validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (tab === "register" && form.name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    
    if (!emailRegex.test(form.email.trim())) {
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
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("Error de conexión con el servidor.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <UtensilsCrossed size={40} color="var(--color-primary)" style={{ margin: "0 auto 0.5rem" }} />
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "1.75rem" }}>
            Gastro<span style={{ color: "var(--color-primary)" }}>Cocha</span>
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Inicia sesión para acceder a tu cuenta</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", marginBottom: "1.5rem", borderRadius: 12, overflow: "hidden", border: "1px solid var(--color-border)" }}>
          <button
            onClick={() => { setTab("login"); setError(""); }}
            style={{
              flex: 1, padding: "0.65rem", border: "none", cursor: "pointer", fontWeight: 600,
              fontFamily: "'Outfit', sans-serif", fontSize: "0.9rem",
              background: tab === "login" ? "var(--color-primary)" : "var(--color-bg)",
              color: tab === "login" ? "white" : "var(--color-text-muted)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <LogIn size={16} /> Ingresar
          </button>
          <button
            onClick={() => { setTab("register"); setError(""); }}
            style={{
              flex: 1, padding: "0.65rem", border: "none", cursor: "pointer", fontWeight: 600,
              fontFamily: "'Outfit', sans-serif", fontSize: "0.9rem",
              background: tab === "register" ? "var(--color-primary)" : "var(--color-bg)",
              color: tab === "register" ? "white" : "var(--color-text-muted)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <UserPlus size={16} /> Registrarse
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {tab === "register" && (
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, marginBottom: 4 }}>Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tu nombre completo"
                required={tab === "register"}
                style={{ width: "100%", padding: "0.65rem 0.9rem", borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-bg-card)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, marginBottom: 4 }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com"
              required
              style={{ width: "100%", padding: "0.65rem 0.9rem", borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, marginBottom: 4 }}>Contraseña</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••"
                required
                minLength={6}
                style={{ width: "100%", padding: "0.65rem 2.5rem 0.65rem 0.9rem", borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-bg-card)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: "color-mix(in srgb, var(--color-accent) 15%, transparent)", color: "var(--color-accent)", padding: "0.6rem 0.9rem", borderRadius: 10, fontSize: "0.85rem" }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "0.75rem", borderRadius: 12, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))", color: "white",
              fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: "1rem",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Procesando..." : tab === "login" ? "Ingresar" : "Crear Cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
