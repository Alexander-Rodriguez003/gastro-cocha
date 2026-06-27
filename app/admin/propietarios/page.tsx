"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Key, UserPlus, RefreshCw, Check, AlertTriangle, Building, Mail, ShieldAlert } from "lucide-react";

interface Owner {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Lugar {
  id: number;
  nombre: string;
  direccion: string | null;
  contacto_propietario: string | null;
  nombre_propietario: string | null;
  email_propietario: string | null;
  slug: string;
}

export default function AdminPropietariosPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create Owner Account Form States
  const [selectedLugarId, setSelectedLugarId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Reset Password States
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/owners");
      const data = await res.json();
      if (res.ok && data.success) {
        setOwners(data.owners);
        setLugares(data.lugares);
      } else {
        setError(data.error || "No autorizado");
      }
    } catch {
      setError("Error de conexión al cargar datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const normalizeEmail = (email: string) =>
    email.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x00-\x7F]/g, "");

  const handleSelectLugar = (lugar: Lugar) => {
    setSelectedLugarId(lugar.id);
    setNewName(lugar.nombre_propietario || "");
    setNewEmail(lugar.email_propietario ? normalizeEmail(lugar.email_propietario) : "");
    setNewPassword(Math.random().toString(36).slice(-8));
    setSuccessMsg("");
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLugarId || !newName || !newEmail || !newPassword) return;

    setSubmitting(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_owner",
          name: newName,
          email: newEmail,
          password: newPassword,
          lugarId: selectedLugarId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`¡Cuenta para ${newName} (${newEmail}) creada e instalada con la contraseña: ${newPassword}!`);
        setSelectedLugarId(null);
        fetchData();
      } else {
        alert(data.error || "Error al crear la cuenta.");
      }
    } catch {
      alert("Error de conexión.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetPassword) return;

    setSubmitting(true);
    setResetSuccess("");

    try {
      const res = await fetch("/api/admin/owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password",
          email: resetEmail,
          password: resetPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResetSuccess(`¡Contraseña restablecida exitosamente para ${resetEmail}!`);
        setResetPassword("");
        setTimeout(() => setResetSuccess(""), 4000);
      } else {
        alert(data.error || "Error al restablecer la contraseña.");
      }
    } catch {
      alert("Error de conexión.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <p style={{ color: "var(--color-text-muted)" }}>Cargando portal de propietarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: "4rem auto", padding: "2rem", textAlign: "center" }}>
        <div style={{ background: "var(--color-surface-warm)", border: "1px solid var(--color-primary)", borderRadius: "var(--radius-lg)", padding: "2rem" }}>
          <ShieldAlert size={48} color="var(--color-primary)" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem", marginBottom: "0.5rem" }}>Acceso Denegado</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Back link */}
      <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Volver al Panel Admin
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
        <Key size={28} color="var(--color-primary)" />
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem" }}>Propietarios de Negocios</h1>
      </div>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
        Asigna cuentas de acceso con rol `owner` a los correos de contacto de cada restaurante y reestablece sus contraseñas.
      </p>

      {successMsg && (
        <div style={{ background: "var(--color-surface-green)", color: "var(--color-secondary-dark)", padding: "1rem", borderRadius: "var(--radius-lg)", marginBottom: "1.5rem", border: "1px solid rgba(16, 185, 129, 0.2)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>
        
        {/* Restaurants and their Owner link status */}
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
            <Building size={18} color="var(--color-text-muted)" /> Negocios Aprobados ({lugares.length})
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {lugares.map((lugar) => {
              // Find if this place has a matching user account
              const hasAccount = lugar.email_propietario 
                ? owners.some(o => o.email.toLowerCase() === lugar.email_propietario?.toLowerCase())
                : false;
              
              return (
                <div 
                  key={lugar.id} 
                  className="card" 
                  style={{ 
                    padding: "1.25rem", 
                    borderLeft: `4px solid ${hasAccount ? "var(--color-secondary)" : "var(--color-primary)"}`,
                    background: "var(--color-bg-card)",
                    transition: "transform 0.2s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem" }}>{lugar.nombre}</h3>
                      <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: 4 }}>
                        Dirección: {lugar.direccion || "—"}
                      </p>
                      
                      <div style={{ marginTop: 8, display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                        <div>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Propietario Contacto</span>
                          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{lugar.nombre_propietario || "—"}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Email de Contacto</span>
                          <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                            <Mail size={12} /> {lugar.email_propietario || "(Sin email asignado)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {hasAccount ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <span style={{ background: "var(--color-surface-green)", color: "var(--color-secondary-dark)", fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: 6, fontWeight: 700 }}>
                            Con Cuenta Activa
                          </span>
                          <button 
                            onClick={() => {
                              setResetEmail(lugar.email_propietario || "");
                              setResetPassword(Math.random().toString(36).slice(-8));
                            }}
                            className="btn-secondary" 
                            style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }}
                          >
                            <RefreshCw size={12} /> Reset Contraseña
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <span style={{ background: "var(--color-surface-warm)", color: "var(--color-primary-dark)", fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: 6, fontWeight: 700 }}>
                            Falta Cuenta Propietario
                          </span>
                          <button 
                            onClick={() => handleSelectLugar(lugar)} 
                            className="btn-primary" 
                            style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }}
                          >
                            <UserPlus size={12} /> Crear Cuenta
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Create Owner Form */}
          {selectedLugarId && (
            <div className="card" style={{ padding: "1.5rem", border: "1px solid var(--color-primary)" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
                <UserPlus size={18} color="var(--color-primary)" /> Registrar Dueño
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                Crearás un usuario con acceso exclusivo al menú de este local.
              </p>

              <form onSubmit={handleCreateOwner} style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>Nombre Completo</label>
                  <input 
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.8rem" }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>Email del Dueño</label>
                  <input 
                    type="text"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.8rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>Contraseña Inicial</label>
                  <input 
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.8rem" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: 4 }}>
                  <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, padding: "0.5rem", fontSize: "0.8rem" }}>
                    {submitting ? "Creando..." : "Crear Acceso"}
                  </button>
                  <button type="button" onClick={() => setSelectedLugarId(null)} className="btn-secondary" style={{ padding: "0.5rem", fontSize: "0.8rem" }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reset Password Form */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
              <RefreshCw size={18} color="var(--color-secondary)" /> Resetear Acceso
            </h3>
            
            {resetSuccess && (
              <div style={{ background: "var(--color-surface-green)", color: "var(--color-secondary-dark)", padding: "0.5rem", borderRadius: "var(--radius)", fontSize: "0.75rem", marginBottom: "1rem" }}>
                {resetSuccess}
              </div>
            )}

            <form onSubmit={handleResetPassword} style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>Email del Propietario</label>
                <input 
                  type="email"
                  required
                  placeholder="ejemplo@dueño.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.8rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>Nueva Contraseña</label>
                <input 
                  type="text"
                  required
                  placeholder="Nueva contraseña temporal"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.8rem" }}
                />
              </div>

              <button type="submit" disabled={submitting || !resetEmail || !resetPassword} className="btn-secondary" style={{ width: "100%", padding: "0.55rem", fontSize: "0.8rem" }}>
                Reestablecer Contraseña
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
