"use client";

import { useState, useEffect } from "react";
import { Store, Utensils, Sparkles, Phone, MapPin, Tag, Plus, Trash2, Save, LayoutGrid, Check } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { OptimizedImage } from "@/components/OptimizedImage";

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.75rem" }}>
        <div>
          <span className="badge badge-forest" style={{ marginBottom: "0.5rem" }}>Panel del Propietario</span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.25rem)", color: "var(--color-ink)", marginTop: 4 }}>
            {lugar?.nombre}
          </h1>
          <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", marginTop: 4 }}>
            Administra la información, platos tradicionales y especialidades de tu local.
          </p>
        </div>
        <a href={`/negocio/${lugar?.slug}`} className="btn-secondary" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.85rem", padding: "0.5rem 1.1rem" }}>
          Ver en el sitio <LayoutGrid size={15} />
        </a>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: "2rem" }}>
        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`tab-btn ${activeTab === "details" ? "tab-btn-active" : ""}`}
        >
          Información Básica
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("platos")}
          className={`tab-btn ${activeTab === "platos" ? "tab-btn-active" : ""}`}
        >
          Menú Típico
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("specialties")}
          className={`tab-btn ${activeTab === "specialties" ? "tab-btn-active" : ""}`}
        >
          Especialidades Propias
        </button>
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.25rem", marginBottom: "1.35rem", color: "var(--color-ink)" }}>
            Editar Perfil del Local
          </h2>
          
          <div style={{ display: "grid", gap: "1.25rem" }}>
            <div className="responsive-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label htmlFor="owner-tel" style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: "0.35rem" }}>Teléfono Público</label>
                <div style={{ position: "relative" }}>
                  <Phone size={15} color="var(--color-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    id="owner-tel"
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="input-editorial"
                    style={{ paddingLeft: "2.25rem" }}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="owner-dir" style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: "0.35rem" }}>Dirección Física</label>
                <div style={{ position: "relative" }}>
                  <MapPin size={15} color="var(--color-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    id="owner-dir"
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="input-editorial"
                    style={{ paddingLeft: "2.25rem" }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="owner-desc" style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: "0.35rem" }}>Descripción del Local</label>
              <textarea
                id="owner-desc"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Cuéntale a tus comensales sobre tu historia, ambiente o platillos estrella."
                rows={4}
                className="input-editorial"
                style={{ resize: "vertical" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: "0.35rem" }}>Imagen de Portada</label>
              <ImageUpload currentUrl={imagenUrl} onUrlChange={setImagenUrl} />
            </div>

            {detailsSuccess && (
              <div role="status" style={{ background: "var(--color-surface-green)", color: "var(--color-secondary-dark)", padding: "0.75rem", borderRadius: "var(--radius-md)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
                <Check size={16} /> Perfil actualizado exitosamente.
              </div>
            )}

            <div>
              <button onClick={handleUpdateDetails} disabled={detailsSaving} className="btn-primary">
                <Save size={15} /> {detailsSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Platos Tab */}
      {activeTab === "platos" && (
        <div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.3rem", marginBottom: "0.4rem", color: "var(--color-ink)" }}>
            Personaliza tus Platos Típicos
          </h2>
          <p style={{ color: "var(--color-muted)", fontSize: "0.86rem", marginBottom: "1.5rem" }}>
            Establece los precios reales de los platos tradicionales que sirves en tu local y sube tus propias fotos.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {platos.map((plato) => (
              <div key={plato.id} className="card" style={{ padding: "1.25rem", display: "flex", gap: "1rem", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <OptimizedImage
                    src={plato.pivot?.imagen_url || plato.imagen_url}
                    alt={plato.nombre}
                    width={68}
                    height={68}
                    style={{ width: 68, height: 68, borderRadius: "var(--radius-md)", objectFit: "cover", background: "var(--color-amber-light)", flexShrink: 0 }}
                  />
                  <div>
                    <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.05rem", color: "var(--color-ink)" }}>{plato.nombre}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
                        Precio: <strong>{plato.pivot?.precio_aproximado ? `${plato.pivot.precio_aproximado} Bs` : "No definido"}</strong>
                      </span>
                      {plato.pivot?.imagen_url && (
                        <span className="badge badge-forest" style={{ fontSize: "0.6rem", padding: "0.15rem 0.45rem" }}>
                          Foto propia
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
                        className="input-editorial"
                        style={{ padding: "0.45rem 0.65rem", fontSize: "0.82rem" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>Foto de tu plato</label>
                      <ImageUpload currentUrl={plateImagen} onUrlChange={setPlateImagen} />
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: 4 }}>
                      <button onClick={() => handleSavePlate(plato.id)} disabled={plateSaving} className="btn-primary" style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}>
                        {plateSaving ? "Guardando..." : "Guardar"}
                      </button>
                      <button onClick={() => setEditingPlateId(null)} className="btn-secondary" style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => handleStartEditPlate(plato)} className="btn-secondary" style={{ width: "100%", padding: "0.45rem", fontSize: "0.8rem", justifyContent: "center" }}>
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
        <div className="responsive-2col" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }}>
          
          {/* List */}
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.25rem", marginBottom: "1.25rem", color: "var(--color-ink)" }}>
              Tus Especialidades Propias
            </h2>
            {(!lugar?.especialidades || lugar.especialidades.length === 0) ? (
              <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                <Sparkles size={30} color="var(--color-amber)" style={{ margin: "0 auto 0.75rem" }} />
                <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
                  Aún no has registrado ninguna especialidad única para tu local.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {lugar.especialidades.map((spec) => (
                  <div key={spec.id} className="card" style={{ padding: "1.15rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <OptimizedImage
                        src={spec.imagen_url}
                        alt={spec.nombre}
                        width={60}
                        height={60}
                        style={{ width: 60, height: 60, borderRadius: "var(--radius-md)", objectFit: "cover", background: "var(--color-amber-light)", flexShrink: 0 }}
                      />
                      <div>
                        <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.05rem", color: "var(--color-ink)" }}>{spec.nombre}</h3>
                        <span style={{ fontSize: "0.82rem", color: "var(--color-muted)" }}>
                          Precio: <strong style={{ color: "var(--color-forest)" }}>{spec.precio} Bs</strong>
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteSpecialty(spec.id)} aria-label={`Eliminar ${spec.nombre}`} style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer", padding: "0.5rem" }} title="Eliminar especialidad">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Form */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.12rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 6, color: "var(--color-ink)" }}>
              <Plus size={18} color="var(--color-amber)" /> Nueva Especialidad
            </h3>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label htmlFor="spec-nombre" style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}>Nombre del plato</label>
                <input
                  id="spec-nombre"
                  type="text"
                  value={newSpecName}
                  onChange={(e) => setNewSpecName(e.target.value)}
                  placeholder="Ej: Trucha al Ajo del Chef"
                  className="input-editorial"
                  style={{ padding: "0.5rem 0.7rem", fontSize: "0.84rem" }}
                />
              </div>

              <div>
                <label htmlFor="spec-precio" style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}>Precio (Bs)</label>
                <input
                  id="spec-precio"
                  type="number"
                  value={newSpecPrecio}
                  onChange={(e) => setNewSpecPrecio(e.target.value)}
                  placeholder="Ej: 35"
                  className="input-editorial"
                  style={{ padding: "0.5rem 0.7rem", fontSize: "0.84rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}>Imagen</label>
                <ImageUpload currentUrl={newSpecImagen} onUrlChange={setNewSpecImagen} />
              </div>

              <button
                onClick={handleAddSpecialty}
                disabled={!newSpecName || !newSpecPrecio || specSaving}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "0.6rem 1rem", fontSize: "0.84rem", marginTop: 4 }}
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
