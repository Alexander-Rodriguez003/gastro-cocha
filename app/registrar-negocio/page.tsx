"use client";

import { useState, useEffect } from "react";
import { Store, AlertTriangle, Sparkles, Check } from "lucide-react";

export default function RegistrarNegocioPage() {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [platos, setPlatos] = useState("");
  const [autoFilled, setAutoFilled] = useState(false);

  // Listen to AI Agent dynamic form filling action
  useEffect(() => {
    const handleAiAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      const data = customEvent.detail;
      if (!data) return;

      if (data.action === "fill_form") {
        if (data.nombre) setNombre(data.nombre);
        if (data.direccion) setDireccion(data.direccion);
        if (data.telefono) setTelefono(data.telefono);
        if (data.platos) setPlatos(data.platos);
        
        setAutoFilled(true);
        setTimeout(() => setAutoFilled(false), 8000);
      }
    };

    window.addEventListener("gastro_action", handleAiAction);
    return () => {
      window.removeEventListener("gastro_action", handleAiAction);
    };
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2.5rem", display: "flex", alignItems: "center", gap: 10, marginBottom: "0.5rem" }}>
        <Store size={32} color="var(--color-primary)" /> Registra tu Negocio
      </h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", lineHeight: 1.6 }}>
        ¿Tienes un restaurante, puesto de comida o local en alguna carretera de Cochabamba?
        Regístralo aquí para que aparezca en nuestra guía y el chatbot pueda recomendarlo.
      </p>

      {/* Dynamic AI Auto-Filled Banner */}
      {autoFilled && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))",
            border: "2px solid #10B981",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem",
            marginBottom: "2.0rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 0 15px rgba(16,185,129,0.2)",
            animation: "pulseFillBanner 0.4s ease",
          }}
        >
          <div style={{ background: "#10B981", color: "#020617", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "#047857" }}>
              ✨ ¡Pre-rellenado por la Inteligencia Artificial!
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: 2 }}>
              El asistente GastroCocha ha detectado tus datos y los ha cargado en el formulario.
            </div>
          </div>
        </div>
      )}

      {/* Feature toggle notice */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem", background: "var(--color-surface-warm)", border: "1px solid var(--color-primary)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
          <AlertTriangle size={20} color="var(--color-primary-dark)" />
          <strong style={{ fontFamily: "var(--font-display)" }}>Formulario Activo (Pre-rellenado disponible)</strong>
        </div>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          ¡El chatbot puede escribir directamente en esta página! Cuéntale sobre tu negocio en el chat de la esquina inferior derecha y observa cómo se cargan los datos. El guardado en la nube se habilitará próximamente.
        </p>
      </div>

      {/* Dynamic Form */}
      <div className="card" style={{ padding: "2rem" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", marginBottom: "1.5rem" }}>
          Información del Establecimiento
        </h2>
        <div style={{ display: "grid", gap: "1.25rem" }}>
          
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>Nombre del local</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Picantería Don Pepe"
              style={{
                width: "100%", padding: "0.65rem 0.9rem", borderRadius: "var(--radius)",
                border: "1px solid var(--color-border)", background: "var(--color-bg)",
                fontSize: "0.85rem", outline: "none", transition: "all 0.3s ease"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>Dirección / Referencia</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Carretera Cbba-Sacaba Km 5, frente a la gasolinera"
              style={{
                width: "100%", padding: "0.65rem 0.9rem", borderRadius: "var(--radius)",
                border: "1px solid var(--color-border)", background: "var(--color-bg)",
                fontSize: "0.85rem", outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>Teléfono de contacto</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+591 7XXXXXXX"
              style={{
                width: "100%", padding: "0.65rem 0.9rem", borderRadius: "var(--radius)",
                border: "1px solid var(--color-border)", background: "var(--color-bg)",
                fontSize: "0.85rem", outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>¿Qué platos sirves? (Especialidades)</label>
            <textarea
              value={platos}
              onChange={(e) => setPlatos(e.target.value)}
              placeholder="Ej: Silpancho, Chicharrón, Fricasé..."
              rows={3}
              style={{
                width: "100%", padding: "0.65rem 0.9rem", borderRadius: "var(--radius)",
                border: "1px solid var(--color-border)", background: "var(--color-bg)",
                fontSize: "0.85rem", outline: "none", resize: "vertical"
              }}
            />
          </div>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button 
              className="btn-primary" 
              onClick={() => alert("¡Tu solicitud de registro ha sido enviada al administrador! Estará aprobada muy pronto. ¡Gracias por unirte a GastroCocha!")}
              disabled={!nombre || !direccion}
              style={{ 
                padding: "0.75rem 2rem", 
                borderRadius: "var(--radius-lg)",
                cursor: (nombre && direccion) ? "pointer" : "not-allowed",
                opacity: (nombre && direccion) ? 1 : 0.6
              }}
            >
              🚀 Registrar Mi Negocio
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulseFillBanner {
          from { opacity: 0; transform: translateY(-15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
