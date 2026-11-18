"use client";

import { useState, useEffect } from "react";
import { Store, Sparkles, Check } from "lucide-react";

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
  const [formError, setFormError] = useState("");

  const handleCheckboxChange = (plato: string) => {
    setPlatosSeleccionados((prev) =>
      prev.includes(plato)
        ? prev.filter((p) => p !== plato)
        : [...prev, plato]
    );
  };

  const handleSubmit = async () => {
    setFormError("");
    if (!nombre || !direccion) return;

    const cleanEmail = emailPropietario.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (emailPropietario && cleanEmail !== emailPropietario.trim()) {
      setFormError("El email contiene caracteres no válidos (como ñ, tildes, etc.).");
      return;
    }
    if (emailPropietario && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError("El formato del email no es válido.");
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
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || "Hubo un error al enviar la solicitud.");
      }
    } catch {
      setFormError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Listen to AI Agent dynamic form filling action (live or via pending navigation)
  useEffect(() => {
    const applyFill = (data: any) => {
      if (!data || data.action !== "fill_form") return;
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
    };

    try {
      const pending = sessionStorage.getItem("gastro_pending_action");
      if (pending) {
        const parsed = JSON.parse(pending);
        if (parsed?.action === "fill_form") {
          sessionStorage.removeItem("gastro_pending_action");
          applyFill(parsed);
        }
      }
    } catch {}

    const handleAiAction = (e: Event) => {
      applyFill((e as CustomEvent).detail);
    };

    window.addEventListener("gastro_action", handleAiAction);
    return () => {
      window.removeEventListener("gastro_action", handleAiAction);
    };
  }, []);

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "clamp(1.85rem, 4vw, 2.5rem)", display: "flex", alignItems: "center", gap: 10, marginBottom: "0.5rem", color: "var(--color-ink)" }}>
        <Store size={30} color="var(--color-amber)" /> Registra tu Negocio
      </h1>
      <p style={{ color: "var(--color-muted)", marginBottom: "1.75rem", lineHeight: 1.65 }}>
        ¿Tienes un restaurante, puesto de comida o local tradicional en Cochabamba?
        Regístralo aquí. Una vez aprobado por el administrador, podrás gestionar tu menú e imágenes.
      </p>

      {/* Success Banner */}
      {success && (
        <div
          role="status"
          style={{
            background: "var(--color-surface-green)",
            border: "1px solid var(--color-forest)",
            borderRadius: "var(--radius-lg)",
            padding: "1.15rem 1.25rem",
            marginBottom: "1.75rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "var(--shadow-sm)",
            animation: "pulseFillBanner 0.4s ease",
          }}
        >
          <div style={{ background: "var(--color-forest)", color: "#FFFFFF", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Check size={17} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1rem", color: "var(--color-secondary-dark)" }}>
              Solicitud enviada con éxito
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-muted)", marginTop: 2 }}>
              Tu solicitud fue enviada al panel administrativo para su revisión.
            </div>
          </div>
        </div>
      )}

      {/* Dynamic AI Auto-Filled Banner */}
      {autoFilled && (
        <div
          role="status"
          style={{
            background: "var(--color-amber-light)",
            border: "1px solid var(--color-amber)",
            borderRadius: "var(--radius-lg)",
            padding: "1.15rem 1.25rem",
            marginBottom: "1.75rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "var(--shadow-sm)",
            animation: "pulseFillBanner 0.4s ease",
          }}
        >
          <div style={{ background: "var(--color-ink)", color: "var(--color-cream)", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Sparkles size={17} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1rem", color: "var(--color-ink)" }}>
              Pre-rellenado por el asistente
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-muted)", marginTop: 2 }}>
              Revisa los datos cargados antes de enviar tu solicitud.
            </div>
          </div>
        </div>
      )}

      {/* Notice */}
      <div className="card" style={{ padding: "1.25rem 1.4rem", marginBottom: "1.75rem", background: "var(--color-amber-light)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.35rem" }}>
          <Sparkles size={18} color="var(--color-primary-dark)" />
          <strong style={{ fontFamily: "var(--font-serif)", color: "var(--color-ink)" }}>Formulario asistido</strong>
        </div>
        <p style={{ color: "var(--color-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
          El asistente del sitio también puede rellenar este formulario por ti: cuéntale qué platos vendes y dónde queda tu negocio.
        </p>
      </div>

      {/* Form */}
      <div className="card" style={{ padding: "1.75rem" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.35rem", marginBottom: "1.35rem", color: "var(--color-ink)" }}>
          Detalles de tu establecimiento
        </h2>
        <div style={{ display: "grid", gap: "1.2rem" }}>

          <div className="responsive-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label htmlFor="reg-nombre" style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: "0.35rem" }}>Nombre del negocio *</label>
              <input
                id="reg-nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Picantería Don Pepe"
                className="input-editorial"
              />
            </div>
            <div>
              <label htmlFor="reg-provincia" style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: "0.35rem" }}>Provincia</label>
              <select
                id="reg-provincia"
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
                className="input-editorial"
              >
                {PROVINCIAS.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="reg-direccion" style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: "0.35rem" }}>Dirección o referencia *</label>
            <input
              id="reg-direccion"
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Carretera Cbba-Sacaba Km 5, frente a la gasolinera"
              className="input-editorial"
            />
          </div>

          <div className="responsive-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label htmlFor="reg-propietario" style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: "0.35rem" }}>Nombre del dueño</label>
              <input
                id="reg-propietario"
                type="text"
                value={nombrePropietario}
                onChange={(e) => setNombrePropietario(e.target.value)}
                placeholder="Ej: Pedro Arandia"
                className="input-editorial"
              />
            </div>
            <div>
              <label htmlFor="reg-telefono" style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: "0.35rem" }}>Teléfono del local</label>
              <input
                id="reg-telefono"
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+591 7XXXXXXX"
                className="input-editorial"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: "0.35rem" }}>Correo electrónico (propietario)</label>
            <input
              id="reg-email"
              type="email"
              value={emailPropietario}
              onChange={(e) => setEmailPropietario(e.target.value)}
              placeholder="propietario@correo.com"
              className="input-editorial"
            />
            <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginTop: 4, display: "block" }}>
              El administrador usará este correo para vincular tu cuenta de propietario.
            </span>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: "0.5rem" }}>Platos típicos que ofreces</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.5rem", maxHeight: "160px", overflowY: "auto", padding: "0.85rem", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-cream)" }}>
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
            <label htmlFor="reg-especialidades" style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: "0.35rem" }}>Especialidades únicas / platos del local</label>
            <textarea
              id="reg-especialidades"
              value={especialidades}
              onChange={(e) => setEspecialidades(e.target.value)}
              placeholder="Ej: Cappuccino de la Casa, Tarta de Manzana Especial (separados por comas)"
              rows={3}
              className="input-editorial"
              style={{ resize: "vertical" }}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
              Platos propios o creaciones que no forman parte de la lista típica global de Cochabamba.
            </span>
          </div>

          {formError && (
            <div role="alert" style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)", padding: "0.7rem 1rem", borderRadius: "var(--radius-md)", fontSize: "0.85rem", fontWeight: 500 }}>
              {formError}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!nombre || !direccion || loading}
              style={{
                cursor: (nombre && direccion && !loading) ? "pointer" : "not-allowed",
                opacity: (nombre && direccion && !loading) ? 1 : 0.55
              }}
            >
              {loading ? "Enviando..." : "Enviar solicitud de registro"}
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
