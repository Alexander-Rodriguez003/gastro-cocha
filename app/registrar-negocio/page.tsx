import { Store, AlertTriangle } from "lucide-react";

export default function RegistrarNegocioPage() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
        <Store size={28} color="var(--color-primary)" /> Registra tu Negocio
      </h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", lineHeight: 1.6 }}>
        ¿Tienes un restaurante, puesto de comida o local en alguna carretera de Cochabamba?
        Regístralo aquí para que aparezca en nuestra guía y el chatbot pueda recomendarlo.
      </p>

      {/* Feature toggle notice */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem", background: "var(--color-surface-warm)", border: "1px solid var(--color-primary)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
          <AlertTriangle size={20} color="var(--color-primary-dark)" />
          <strong style={{ fontFamily: "var(--font-display)" }}>Próximamente</strong>
        </div>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          El registro público de negocios estará disponible pronto. Mientras tanto, puedes
          contactarnos directamente para agregar tu restaurante a la plataforma.
        </p>
        <div style={{ marginTop: "1rem" }}>
          <a href="mailto:contacto@gastrococha.bo" className="btn-primary" style={{ fontSize: "0.85rem" }}>
            📧 Contactar al equipo
          </a>
        </div>
      </div>

      {/* Form (disabled/preview) */}
      <div style={{ opacity: 0.5, pointerEvents: "none" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.1rem", marginBottom: "1rem" }}>
          Vista previa del formulario
        </h2>
        <div style={{ display: "grid", gap: "1rem" }}>
          <FormField label="Nombre del local" placeholder="Ej: Restaurante Don Pepe" />
          <FormField label="Provincia" placeholder="Seleccionar provincia..." />
          <FormField label="Dirección / Referencia" placeholder="Ej: Carretera Cbba-Sacaba Km 5, frente a la gasolinera" />
          <FormField label="Teléfono de contacto" placeholder="+591 7XXXXXXX" />
          <FormField label="Nombre del propietario" placeholder="Tu nombre completo" />
          <FormField label="¿Qué platos sirves?" placeholder="Ej: Silpancho, Chicharrón, Fricasé..." />
          <div style={{ textAlign: "center", padding: "1rem" }}>
            <button className="btn-primary" disabled style={{ opacity: 0.6 }}>
              Enviar Solicitud (Próximamente)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.35rem" }}>{label}</label>
      <input
        placeholder={placeholder}
        disabled
        style={{
          width: "100%", padding: "0.65rem 0.9rem", borderRadius: "var(--radius)",
          border: "1px solid var(--color-border)", background: "var(--color-bg)",
          fontSize: "0.85rem",
        }}
      />
    </div>
  );
}
