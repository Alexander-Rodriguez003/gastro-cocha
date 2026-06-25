"use client";

import { useState, useEffect } from "react";
import { Store, Utensils, Sparkles, Image, Phone, MapPin, Tag, Plus, Trash2, Save, LayoutGrid, Check } from "lucide-react";

interface Specialty {
  id: number;
  nombre: string;
  precio: number;
  imagen_url: string | null;
}

interface Plato {
  id: number;
  nombre: string;
  descripcion: string;
  imagen_url: string | null;
  pivot?: {
    precio_aproximado: number | null;
    especialidad: boolean;
    imagen_url?: string | null;
  };
}

interface Lugar {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  descripcion: string | null;
  imagen_url: string | null;
  slug: string;
  especialidades?: Specialty[];
}

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState<"details" | "platos" | "specialties">("details");
  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Details form
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsSuccess, setDetailsSuccess] = useState(false);

  // New specialty form
  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecPrecio, setNewSpecPrecio] = useState("");
  const [newSpecImagen, setNewSpecImagen] = useState("");
  const [specSaving, setSpecSaving] = useState(false);

  // Typical plates states
  const [editingPlateId, setEditingPlateId] = useState<number | null>(null);
  const [platePrecio, setPlatePrecio] = useState("");
  const [plateImagen, setPlateImagen] = useState("");
  const [plateSaving, setPlateSaving] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await fetch("/api/owner");
      const data = await res.json();
      if (res.ok && data.success) {
        const { lugar: lug, platos: plats } = data.details;
        setLugar(lug);
        setPlatos(plats);
        setTelefono(lug.telefono || "");
        setDireccion(lug.direccion || "");
        setDescripcion(lug.descripcion || "");
        setImagenUrl(lug.imagen_url || "");
      } else {
        setError(data.error || "No autorizado o negocio no encontrado");
      }
    } catch {
      setError("Error al cargar los datos del negocio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleUpdateDetails = async () => {
    if (!lugar) return;
    setDetailsSaving(true);
    setDetailsSuccess(false);

    try {
      const res = await fetch("/api/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_details",
          telefono,
          direccion,
          descripcion,
          imagen_url: imagenUrl,
        }),
      });

      if (res.ok) {
        setDetailsSuccess(true);
        setTimeout(() => setDetailsSuccess(false), 4000);
        fetchDetails();
      } else {
        alert("Error al actualizar la información.");
      }
    } catch {
      alert("Error de conexión.");
    } finally {
      setDetailsSaving(false);
    }
  };

  const handleStartEditPlate = (p: Plato) => {
    setEditingPlateId(p.id);
    setPlatePrecio(String(p.pivot?.precio_aproximado || ""));
    setPlateImagen(p.pivot?.imagen_url || "");
  };

  const handleSavePlate = async (platoId: number) => {
    setPlateSaving(true);
    try {
      const res = await fetch("/api/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_plato",
          plato_id: platoId,
          precio_aproximado: Number(platePrecio),
          imagen_url: plateImagen || null,
        }),
      });

      if (res.ok) {
        setEditingPlateId(null);
        fetchDetails();
      } else {
        alert("Error al guardar cambios del plato.");
      }
    } catch {
      alert("Error de conexión.");
    } finally {
      setPlateSaving(false);
    }
  };

  const handleAddSpecialty = async () => {
    if (!newSpecName || !newSpecPrecio) return;
    setSpecSaving(true);

    try {
      const res = await fetch("/api/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_specialty",
          nombre: newSpecName,
          precio: Number(newSpecPrecio),
          imagen_url: newSpecImagen || null,
        }),
      });

      if (res.ok) {
        setNewSpecName("");
        setNewSpecPrecio("");
        setNewSpecImagen("");
        fetchDetails();
      } else {
        alert("Error al añadir la especialidad.");
      }
    } catch {
      alert("Error de conexión.");
    } finally {
      setSpecSaving(false);
    }
  };

  const handleDeleteSpecialty = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta especialidad?")) return;

    try {
      const res = await fetch("/api/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_specialty",
          specialty_id: id,
        }),
      });

      if (res.ok) {
        fetchDetails();
      } else {
        alert("Error al eliminar la especialidad.");
      }
    } catch {
      alert("Error de conexión.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <p style={{ color: "var(--color-text-muted)" }}>Cargando portal de propietario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: "4rem auto", padding: "2rem", textAlign: "center" }}>
        <div style={{ background: "var(--color-surface-warm)", border: "1px solid var(--color-primary)", borderRadius: "var(--radius-lg)", padding: "2rem" }}>
          <Store size={48} color="var(--color-primary)" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem", marginBottom: "0.5rem" }}>Acceso Restringido</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>{error}</p>
          <a href="/login" className="btn-primary">Iniciar Sesión</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <span style={{ fontSize: "0.8rem", color: "var(--color-secondary)", fontWeight: 600, textTransform: "uppercase" }}>Panel del Propietario</span>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "2.25rem", color: "var(--color-text)", marginTop: 4 }}>
            {lugar?.nombre}
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginTop: 4 }}>
            Administra la información, platos tradicionales y especialidades que se muestran al público y al chatbot.
          </p>
        </div>
        <a href={`/negocio/${lugar?.slug}`} className="btn-secondary" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
          Ver en el sitio <LayoutGrid size={16} />
        </a>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", marginBottom: "2rem" }}>
        <button
          onClick={() => setActiveTab("details")}
          style={{
            padding: "0.75rem 1.25rem", background: "none", border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: "0.9rem", color: activeTab === "details" ? "var(--color-primary)" : "var(--color-text-muted)",
            borderBottom: activeTab === "details" ? "2px solid var(--color-primary)" : "none",
            transition: "all 0.2s"
          }}
        >
          Información Básica
        </button>
        <button
          onClick={() => setActiveTab("platos")}
          style={{
            padding: "0.75rem 1.25rem", background: "none", border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: "0.9rem", color: activeTab === "platos" ? "var(--color-primary)" : "var(--color-text-muted)",
            borderBottom: activeTab === "platos" ? "2px solid var(--color-primary)" : "none",
            transition: "all 0.2s"
          }}
        >
          Menú Típico
        </button>
        <button
          onClick={() => setActiveTab("specialties")}
          style={{
            padding: "0.75rem 1.25rem", background: "none", border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: "0.9rem", color: activeTab === "specialties" ? "var(--color-primary)" : "var(--color-text-muted)",
            borderBottom: activeTab === "specialties" ? "2px solid var(--color-primary)" : "none",
            transition: "all 0.2s"
          }}
        >
          Especialidades Propias
        </button>
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <div className="card" style={{ padding: "2rem" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1.25rem", marginBottom: "1.5rem" }}>
            Editar Perfil del Local
          </h2>
          
          <div style={{ display: "grid", gap: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>Teléfono Público</label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} color="var(--color-text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    style={{ width: "100%", padding: "0.65rem 0.9rem 0.65rem 2.25rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.85rem" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>Dirección Física</label>
                <div style={{ position: "relative" }}>
                  <MapPin size={16} color="var(--color-text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    style={{ width: "100%", padding: "0.65rem 0.9rem 0.65rem 2.25rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.85rem" }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>Descripción del Local</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Cuéntale a tus comensales sobre tu historia, ambiente o platillos estrella."
                rows={4}
                style={{ width: "100%", padding: "0.65rem 0.9rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.85rem", resize: "vertical" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>Imagen URL de Portada</label>
              <div style={{ position: "relative" }}>
                <Image size={16} color="var(--color-text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  value={imagenUrl}
                  onChange={(e) => setImagenUrl(e.target.value)}
                  placeholder="https://ejemplo.com/foto-portada.jpg"
                  style={{ width: "100%", padding: "0.65rem 0.9rem 0.65rem 2.25rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.85rem" }}
                />
              </div>
            </div>

            {detailsSuccess && (
              <div style={{ background: "var(--color-surface-green)", color: "var(--color-secondary-dark)", padding: "0.75rem", borderRadius: "var(--radius)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
                <Check size={16} /> ¡Perfil actualizado exitosamente!
              </div>
            )}

            <div>
              <button onClick={handleUpdateDetails} disabled={detailsSaving} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", padding: "0.65rem 1.5rem" }}>
                <Save size={16} /> {detailsSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Platos Tab */}
      {activeTab === "platos" && (
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1.25rem", marginBottom: "1.25rem" }}>
            Personaliza tus Platos Típicos
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            Establece los precios reales de los platos tradicionales que sirves en tu local y sube tus propias fotos. Si no subes una foto, se usará la foto genérica en tu landing.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
            {platos.map((plato) => (
              <div key={plato.id} className="card" style={{ padding: "1.25rem", display: "flex", gap: "1rem", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <img
                    src={plato.pivot?.imagen_url || plato.imagen_url || "/images/placeholder-plate.jpg"}
                    alt={plato.nombre}
                    style={{ width: 70, height: 70, borderRadius: "var(--radius)", objectFit: "cover", background: "var(--color-border)" }}
                  />
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem" }}>{plato.nombre}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                        Precio: <strong>{plato.pivot?.precio_aproximado ? `${plato.pivot.precio_aproximado} Bs` : "No definido"}</strong>
                      </span>
                      {plato.pivot?.imagen_url && (
                        <span style={{ background: "var(--color-surface-green)", color: "var(--color-secondary)", fontSize: "0.6rem", padding: "0.1rem 0.35rem", borderRadius: 4, fontWeight: 700, textTransform: "uppercase" }}>
                          Foto Propia
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {editingPlateId === plato.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", borderTop: "1px solid var(--color-border)", paddingTop: "0.75rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>Precio (Bs)</label>
                      <input
                        type="number"
                        value={platePrecio}
                        onChange={(e) => setPlatePrecio(e.target.value)}
                        placeholder="Ej: 20"
                        style={{ width: "100%", padding: "0.45rem 0.65rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.8rem" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>URL de Foto de tu plato</label>
                      <input
                        type="text"
                        value={plateImagen}
                        onChange={(e) => setPlateImagen(e.target.value)}
                        placeholder="https://ejemplo.com/tu-foto.jpg"
                        style={{ width: "100%", padding: "0.45rem 0.65rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.8rem" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: 4 }}>
                      <button onClick={() => handleSavePlate(plato.id)} disabled={plateSaving} className="btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
                        {plateSaving ? "Guardando..." : "Guardar"}
                      </button>
                      <button onClick={() => setEditingPlateId(null)} className="btn-secondary" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => handleStartEditPlate(plato)} className="btn-secondary" style={{ width: "100%", padding: "0.45rem", fontSize: "0.8rem", textAlign: "center" }}>
                    Editar Precio / Foto
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specialties Tab */}
      {activeTab === "specialties" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }}>
          
          {/* List */}
          <div>
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1.25rem", marginBottom: "1.25rem" }}>
              Tus Especialidades Propias
            </h2>
            {(!lugar?.especialidades || lugar.especialidades.length === 0) ? (
              <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                <Sparkles size={32} color="var(--color-primary)" style={{ margin: "0 auto 0.75rem" }} />
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                  Aún no has registrado ninguna especialidad única para tu local. ¡Crea una en el panel de la derecha!
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {lugar.especialidades.map((spec) => (
                  <div key={spec.id} className="card" style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <img
                        src={spec.imagen_url || "/images/placeholder-plate.jpg"}
                        alt={spec.nombre}
                        style={{ width: 60, height: 60, borderRadius: "var(--radius)", objectFit: "cover", background: "var(--color-border)" }}
                      />
                      <div>
                        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem" }}>{spec.nombre}</h3>
                        <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                          Precio: <strong style={{ color: "var(--color-secondary)" }}>{spec.precio} Bs</strong>
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteSpecialty(spec.id)} style={{ background: "none", border: "none", color: "var(--color-accent-light)", cursor: "pointer", padding: "0.5rem" }} title="Eliminar especialidad">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Form */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
              <Plus size={18} color="var(--color-primary)" /> Nueva Especialidad
            </h3>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>Nombre del plato</label>
                <input
                  type="text"
                  value={newSpecName}
                  onChange={(e) => setNewSpecName(e.target.value)}
                  placeholder="Ej: Trucha al Ajo del Chef"
                  style={{ width: "100%", padding: "0.45rem 0.65rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.8rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>Precio (Bs)</label>
                <input
                  type="number"
                  value={newSpecPrecio}
                  onChange={(e) => setNewSpecPrecio(e.target.value)}
                  placeholder="Ej: 35"
                  style={{ width: "100%", padding: "0.45rem 0.65rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.8rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>URL de Imagen</label>
                <input
                  type="text"
                  value={newSpecImagen}
                  onChange={(e) => setNewSpecImagen(e.target.value)}
                  placeholder="https://ejemplo.com/foto-especialidad.jpg"
                  style={{ width: "100%", padding: "0.45rem 0.65rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.8rem" }}
                />
              </div>

              <button
                onClick={handleAddSpecialty}
                disabled={!newSpecName || !newSpecPrecio || specSaving}
                className="btn-primary"
                style={{ width: "100%", padding: "0.55rem", fontSize: "0.8rem", marginTop: 4 }}
              >
                {specSaving ? "Guardando..." : "Agregar Especialidad"}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
