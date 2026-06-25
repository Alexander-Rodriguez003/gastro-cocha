"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Search, MapPin, Eye, EyeOff, ExternalLink, Edit, Trash2, Plus, X } from "lucide-react";
import { LUGARES, PROVINCIAS } from "@/lib/seed-data";

interface LugarRow {
  nombre: string;
  slug: string;
  provincia_slug: string;
  direccion: string;
  telefono: string;
  lat: number;
  lng: number;
  activo: boolean;
  aprobado: boolean;
  imagen_url?: string | null;
}

export default function AdminLugaresPage() {
  const [search, setSearch] = useState("");
  const [lugares, setLugares] = useState<LugarRow[]>(
    LUGARES.map((l: any) => ({
      nombre: l.nombre,
      slug: l.slug,
      provincia_slug: l.provincia_slug,
      direccion: l.direccion,
      telefono: l.telefono,
      lat: l.lat,
      lng: l.lng,
      activo: l.activo,
      aprobado: l.aprobado,
      imagen_url: l.imagen_url || null,
    }))
  );

  const [hasMounted, setHasMounted] = useState(false);
  const [editingLugar, setEditingLugar] = useState<LugarRow | null>(null);

  // Load from localStorage safely on mount
  useEffect(() => {
    const saved = localStorage.getItem("gastro_lugares");
    if (saved) {
      try {
        setLugares(JSON.parse(saved));
      } catch (err) {
        console.error("Error al cargar locales de localStorage:", err);
      }
    }
    setHasMounted(true);
  }, []);

  // Save to localStorage when lugares change
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem("gastro_lugares", JSON.stringify(lugares));
    }
  }, [lugares, hasMounted]);

  const filtered = lugares.filter((l) =>
    l.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActivo = (slug: string) => {
    setLugares((prev) =>
      prev.map((l) => (l.slug === slug ? { ...l, activo: !l.activo } : l))
    );
  };

  const handleDelete = (slug: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este local?")) {
      setLugares((prev) => prev.filter((l) => l.slug !== slug));
    }
  };

  const handleEditClick = (lugar: LugarRow) => {
    setEditingLugar({ ...lugar });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLugar) return;

    setLugares((prev) =>
      prev.map((l) => (l.slug === editingLugar.slug ? editingLugar : l))
    );
    setEditingLugar(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingLugar) {
          setEditingLugar({
            ...editingLugar,
            imagen_url: reader.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateLugar = () => {
    const nuevoSlug = `nuevo-local-${Date.now()}`;
    const nuevo: LugarRow = {
      nombre: "Nuevo Restaurante / Local",
      slug: nuevoSlug,
      provincia_slug: "cercado",
      direccion: "Calle Falsa #123, Cochabamba",
      telefono: "4200000",
      lat: -17.3895,
      lng: -66.1568,
      activo: true,
      aprobado: true,
      imagen_url: null,
    };
    setLugares((prev) => [nuevo, ...prev]);
    setEditingLugar(nuevo);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Panel Admin
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "1.75rem" }}>
          📍 Gestionar Lugares ({filtered.length})
        </h1>
        <button onClick={handleCreateLugar} className="btn-primary" style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Plus size={16} /> Nuevo Local
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar locales..."
          style={{ width: "100%", padding: "0.65rem 0.9rem 0.65rem 2.5rem", borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-bg-card)", fontSize: "0.9rem", outline: "none" }}
        />
      </div>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {filtered.map((lugar) => (
          <div key={lugar.slug} className="card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                {lugar.nombre}
                {lugar.aprobado && (
                  <span style={{ background: "var(--color-surface-green)", color: "var(--color-secondary-dark)", padding: "2px 8px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600 }}>
                    Aprobado
                  </span>
                )}
              </div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: 2 }}>
                <MapPin size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {lugar.direccion} — <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{lugar.provincia_slug.replace(/-/g, " ")}</span>
              </div>
              {lugar.telefono && (
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>📞 {lugar.telefono}</div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <a
                href={`https://www.google.com/maps?q=${lugar.lat},${lugar.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-primary)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}
              >
                <ExternalLink size={14} /> Ver mapa
              </a>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button onClick={() => handleEditClick(lugar)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Editar">
                  <Edit size={16} color="var(--color-primary)" />
                </button>
                <button onClick={() => toggleActivo(lugar.slug)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} title={lugar.activo ? "Desactivar" : "Activar"}>
                  {lugar.activo ? <Eye size={18} color="var(--color-secondary)" /> : <EyeOff size={18} color="var(--color-text-muted)" />}
                </button>
                <button onClick={() => handleDelete(lugar.slug)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Eliminar">
                  <Trash2 size={16} color="#EF4444" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal Popup */}
      {editingLugar && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.4)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center", padding: "1.5rem"
        }}>
          <div style={{
            background: "var(--color-bg-card)", borderRadius: 16, border: "var(--color-border)",
            width: "100%", maxWidth: 500, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            overflow: "hidden", display: "flex", flexDirection: "column"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", background: "color-mix(in srgb, var(--color-primary) 4%, transparent)" }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "var(--color-primary-dark)" }}>
                ✏️ Editar Información de Local
              </h3>
              <button onClick={() => setEditingLugar(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEdit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.85rem", overflowY: "auto", maxHeight: "80vh" }}>
              {/* Image Preview & Upload */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
                <div style={{
                  width: 90, height: 90, borderRadius: 12, overflow: "hidden",
                  background: "var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px dashed rgba(217, 119, 6, 0.3)"
                }}>
                  {editingLugar.imagen_url ? (
                    <img src={editingLugar.imagen_url} alt="Vista previa" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "2rem" }}>📍</span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary-dark)", textAlign: "center" }}>
                    Subir foto del local
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ fontSize: "0.75rem", alignSelf: "center", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textAlign: "center" }}>o pega un enlace de internet abajo:</span>
                  <input
                    type="text"
                    placeholder="https://ejemplo.com/foto-restaurante.jpg"
                    value={editingLugar.imagen_url || ""}
                    onChange={(e) => setEditingLugar({ ...editingLugar, imagen_url: e.target.value })}
                    style={{ padding: "0.45rem 0.65rem", borderRadius: 8, border: "1px solid var(--color-border)", outline: "none", fontSize: "0.8rem", width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)" }}>Nombre del Local</label>
                <input
                  type="text"
                  required
                  value={editingLugar.nombre}
                  onChange={(e) => setEditingLugar({ ...editingLugar, nombre: e.target.value })}
                  style={{ padding: "0.55rem 0.75rem", borderRadius: 10, border: "1px solid var(--color-border)", outline: "none", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)" }}>Dirección</label>
                <input
                  type="text"
                  required
                  value={editingLugar.direccion}
                  onChange={(e) => setEditingLugar({ ...editingLugar, direccion: e.target.value })}
                  style={{ padding: "0.55rem 0.75rem", borderRadius: 10, border: "1px solid var(--color-border)", outline: "none", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)" }}>Provincia Origen</label>
                <select
                  value={editingLugar.provincia_slug}
                  onChange={(e) => setEditingLugar({ ...editingLugar, provincia_slug: e.target.value })}
                  style={{ padding: "0.55rem 0.75rem", borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-bg-card)", outline: "none", fontSize: "0.9rem", cursor: "pointer" }}
                >
                  {PROVINCIAS.map((p) => (
                    <option key={p.slug} value={p.slug}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)" }}>Teléfono de Contacto</label>
                <input
                  type="text"
                  value={editingLugar.telefono}
                  onChange={(e) => setEditingLugar({ ...editingLugar, telefono: e.target.value })}
                  style={{ padding: "0.55rem 0.75rem", borderRadius: 10, border: "1px solid var(--color-border)", outline: "none", fontSize: "0.9rem" }}
                />
              </div>

              {/* Coordinates Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)" }}>Latitud (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingLugar.lat}
                    onChange={(e) => setEditingLugar({ ...editingLugar, lat: Number(e.target.value) })}
                    style={{ padding: "0.55rem 0.75rem", borderRadius: 10, border: "1px solid var(--color-border)", outline: "none", fontSize: "0.9rem" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)" }}>Longitud (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingLugar.lng}
                    onChange={(e) => setEditingLugar({ ...editingLugar, lng: Number(e.target.value) })}
                    style={{ padding: "0.55rem 0.75rem", borderRadius: 10, border: "1px solid var(--color-border)", outline: "none", fontSize: "0.9rem" }}
                  />
                </div>
              </div>

              {/* Switches */}
              <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.4rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", cursor: "pointer", fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={editingLugar.aprobado}
                    onChange={(e) => setEditingLugar({ ...editingLugar, aprobado: e.target.checked })}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  🟢 Aprobado
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", cursor: "pointer", fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={editingLugar.activo}
                    onChange={(e) => setEditingLugar({ ...editingLugar, activo: e.target.checked })}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  👁️ Activo
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.75rem" }}>
                <button type="button" onClick={() => setEditingLugar(null)} className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
