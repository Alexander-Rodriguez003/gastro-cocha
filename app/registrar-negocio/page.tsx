"use client";

import { useState, useEffect } from "react";
import { Store, AlertTriangle, Sparkles, Check } from "lucide-react";

const PLATOS_TIPICOS = [
  "Silpancho", "Pique Macho", "Chajchu", "Chicharrón de Cerdo",
  "Fricasé", "Pato al Horno", "Trucha del Chapare", "Tambaquí Frito",
  "Rosquetes de Punata", "Cuñapé", "Pichón de Cliza", "Chorizo Tarateño",
  "Pan de Arani", "Uchucu Totoreño", "Lechón al Horno", "Trucha de Laguna"
];

const PROVINCIAS = [
  "Cercado", "Quillacollo", "Punata", "Chapare", "Germán Jordán", 
  "Esteban Arce", "Arani", "Carrasco", "Mizque", "Tiraque", 
  "Ayopaya", "Capinota", "Bolívar", "Arque", "Tapacarí", "Campero"
];

export default function RegistrarNegocioPage() {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [provincia, setProvincia] = useState("Cercado");
  const [nombrePropietario, setNombrePropietario] = useState("");
  const [emailPropietario, setEmailPropietario] = useState("");
  const [platosSeleccionados, setPlatosSeleccionados] = useState<string[]>([]);
  const [especialidades, setEspecialidades] = useState("");
  const [autoFilled, setAutoFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCheckboxChange = (plato: string) => {
    setPlatosSeleccionados((prev) =>
      prev.includes(plato)
        ? prev.filter((p) => p !== plato)
        : [...prev, plato]
    );
  };

  const handleSubmit = async () => {
    if (!nombre || !direccion) return;

    const cleanEmail = emailPropietario.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (emailPropietario && cleanEmail !== emailPropietario.trim()) {
      alert("El email contiene caracteres no válidos (como ñ, tildes, etc.).");
      return;
    }
    if (emailPropietario && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      alert("El formato del email no es válido.");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          direccion,
          telefono,
          nombre_propietario: nombrePropietario || "Propietario Demo",
          email_propietario: emailPropietario || null,
          provincia,
          platos: platosSeleccionados.join(", "),
          especialidades,
          lat: -17.3935 + (Math.random() - 0.5) * 0.03,
          lng: -66.1570 + (Math.random() - 0.5) * 0.03,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setNombre("");
        setDireccion("");
        setTelefono("");
        setNombrePropietario("");
        setEmailPropietario("");
        setPlatosSeleccionados([]);
        setEspecialidades("");
        setTimeout(() => setSuccess(false), 8000);
      } else {
        alert("Hubo un error al enviar la solicitud.");
      }
    } catch {
      alert("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

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
        if (data.provincia) {
          const match = PROVINCIAS.find(p => p.toLowerCase() === data.provincia.toLowerCase());
          if (match) setProvincia(match);
        }
        if (data.nombre_propietario) setNombrePropietario(data.nombre_propietario);
        if (data.email_propietario) setEmailPropietario(data.email_propietario);
        if (data.platos) {
          const list = data.platos.split(",").map((p: string) => p.trim());
          const typicals = list.filter((p: string) => 
            PLATOS_TIPICOS.some(pt => pt.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(pt.toLowerCase()))
          ).map((p: string) => 
            PLATOS_TIPICOS.find(pt => pt.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(pt.toLowerCase()))!
          ).filter(Boolean);

          const customs = list.filter((p: string) => 
            !PLATOS_TIPICOS.some(pt => pt.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(pt.toLowerCase()))
          );

          setPlatosSeleccionados(typicals);
          if (customs.length > 0) setEspecialidades(customs.join(", "));
        }
        
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
    <div style={{ maxWidth: 750, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "2.5rem", display: "flex", alignItems: "center", gap: 10, marginBottom: "0.5rem" }}>
        <Store size={32} color="var(--color-primary)" /> Registra tu Negocio
      </h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", lineHeight: 1.6 }}>
        ¿Tienes un restaurante, puesto de comida o local tradicional en Cochabamba?
        Regístralo aquí. Una vez aprobado por el administrador, podrás gestionar tu menú e imágenes.
      </p>

      {/* Success Banner */}
      {success && (
        <div
          style={{
            background: "var(--color-surface-green)",
            border: "1px solid var(--color-secondary)",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem",
            marginBottom: "2.0rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "var(--shadow-sm)",
            animation: "pulseFillBanner 0.4s ease",
          }}
        >
          <div style={{ background: "var(--color-secondary)", color: "#FFFFFF", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Check size={18} />
          </div>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1rem", color: "var(--color-secondary-dark)" }}>
              ¡Solicitud Enviada con Éxito!
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: 2 }}>
              Tu solicitud fue enviada al panel administrativo. El administrador te contactará para entregarte tus credenciales de propietario.
            </div>
          </div>
        </div>
      )}

      {/* Dynamic AI Auto-Filled Banner */}
      {autoFilled && (
        <div
          style={{
            background: "var(--color-surface-warm)",
            border: "1px solid rgba(217, 119, 6, 0.25)",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem",
            marginBottom: "2.0rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "var(--shadow-sm)",
            animation: "pulseFillBanner 0.4s ease",
          }}
        >
          <div style={{ background: "var(--color-primary)", color: "#FFFFFF", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1rem", color: "var(--color-primary-dark)" }}>
              ¡Pre-rellenado por la Inteligencia Artificial!
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: 2 }}>
              El asistente GastroCocha ha detectado tus datos y los ha cargado en el formulario.
            </div>
          </div>
        </div>
      )}

      {/* Notice */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem", background: "var(--color-surface-warm)", border: "1px solid var(--color-primary)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
          <AlertTriangle size={20} color="var(--color-primary-dark)" />
          <strong style={{ fontFamily: "var(--font-display)" }}>Formulario Interactivo</strong>
        </div>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          El chatbot del sitio puede rellenar este formulario por ti en tiempo real. Cuéntale qué platos vendes y dónde queda tu negocio.
        </p>
      </div>

      {/* Form */}
      <div className="card" style={{ padding: "2rem" }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1.3rem", marginBottom: "1.5rem", color: "var(--color-text)" }}>
          Detalles de tu Establecimiento
        </h2>
        <div style={{ display: "grid", gap: "1.25rem" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>Nombre del negocio</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Picantería Don Pepe"
                style={{ width: "100%", padding: "0.65rem 0.9rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.85rem", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>Provincia</label>
              <select
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
                style={{ width: "100%", padding: "0.65rem 0.9rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.85rem", outline: "none" }}
              >
                {PROVINCIAS.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>Dirección o Referencia</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Carretera Cbba-Sacaba Km 5, frente a la gasolinera"
              style={{ width: "100%", padding: "0.65rem 0.9rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.85rem", outline: "none" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>Nombre del dueño</label>
              <input
                type="text"
                value={nombrePropietario}
                onChange={(e) => setNombrePropietario(e.target.value)}
                placeholder="Ej: Pedro Arandia"
                style={{ width: "100%", padding: "0.65rem 0.9rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.85rem", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>Teléfono del local</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+591 7XXXXXXX"
                style={{ width: "100%", padding: "0.65rem 0.9rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.85rem", outline: "none" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>Correo Electrónico (Propietario)</label>
            <input
              type="email"
              value={emailPropietario}
              onChange={(e) => setEmailPropietario(e.target.value)}
              placeholder="propietario@correo.com"
              style={{ width: "100%", padding: "0.65rem 0.9rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.85rem", outline: "none" }}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 4, display: "block" }}>
              El administrador usará este correo para registrar tu cuenta y darte acceso exclusivo a tu menú.
            </span>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Selecciona los Platos Típicos que ofreces</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.5rem", maxHeight: "150px", overflowY: "auto", padding: "0.75rem", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", background: "var(--color-bg)" }}>
              {PLATOS_TIPICOS.map((plato) => (
                <label key={plato} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={platosSeleccionados.includes(plato)}
                    onChange={() => handleCheckboxChange(plato)}
                  />
                  {plato}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>Especialidades Únicas / Platos del Local</label>
            <textarea
              value={especialidades}
              onChange={(e) => setEspecialidades(e.target.value)}
              placeholder="Ej: Cappuccino de la Casa, Tarta de Manzana Especial (separados por comas)"
              rows={3}
              style={{ width: "100%", padding: "0.65rem 0.9rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.85rem", outline: "none", resize: "vertical" }}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              Platos propios o creaciones que no forman parte de la lista típica global de Cochabamba.
            </span>
          </div>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button 
              className="btn-primary" 
              onClick={handleSubmit}
              disabled={!nombre || !direccion || loading}
              style={{ 
                padding: "0.75rem 2rem", 
                borderRadius: "var(--radius-lg)",
                cursor: (nombre && direccion && !loading) ? "pointer" : "not-allowed",
                opacity: (nombre && direccion && !loading) ? 1 : 0.6
              }}
            >
              {loading ? "Enviando..." : "Enviar Solicitud de Registro"}
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
