"use client";
import { useState } from "react";
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
}

export default function AdminLugaresPage() {
  const [search, setSearch] = useState("");
  const [lugares, setLugares] = useState<LugarRow[]>(
    LUGARES.map((l) => ({
      nombre: l.nombre,
      slug: l.slug,
      provincia_slug: l.provincia_slug,
      direccion: l.direccion,
      telefono: l.telefono,
      lat: l.lat,
      lng: l.lng,
      activo: l.activo,
      aprobado: l.aprobado,
    }))
  );

  const [editingLugar, setEditingLugar] = useState<LugarRow | null>(null);

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
    };
    setLugares((prev) => [nuevo, ...prev]);
    setEditingLugar(nuevo);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 4, color: "#78716C", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
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
        <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#78716C" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar locales..."
          style={{ width: "100%", padding: "0.65rem 0.9rem 0.65rem 2.5rem", borderRadius: 12, border: "1px solid #E7E5E4", background: "#FFFBF5", fontSize: "0.9rem", outline: "none" }}
        />
      </div>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {filtered.map((lugar) => (
          <div key={lugar.slug} className="card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                {lugar.nombre}
                {lugar.aprobado && (
                  <span style={{ background: "#D1FAE5", color: "#047857", padding: "2px 8px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600 }}>
                    Aprobado
                  </span>
                )}
              </div>
              <div style={{ color: "#78716C", fontSize: "0.8rem", marginTop: 2 }}>
                <MapPin size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {lugar.direccion} — <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{lugar.provincia_slug.replace(/-/g, " ")}</span>
              </div>
              {lugar.telefono && (
                <div style={{ color: "#78716C", fontSize: "0.8rem" }}>📞 {lugar.telefono}</div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <a
                href={`https://www.google.com/maps?q=${lugar.lat},${lugar.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#D97706", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}
              >
                <ExternalLink size={14} /> Ver mapa
              </a>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button onClick={() => handleEditClick(lugar)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Editar">
                  <Edit size={16} color="#D97706" />
                </button>
                <button onClick={() => toggleActivo(lugar.slug)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} title={lugar.activo ? "Desactivar" : "Activar"}>
                  {lugar.activo ? <Eye size={18} color="#059669" /> : <EyeOff size={18} color="#78716C" />}
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
            background: "#FFFBF5", borderRadius: 16, border: "1px solid rgba(220, 38, 38, 0.12)",
            width: "100%", maxWidth: 500, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            overflow: "hidden", display: "flex", flexDirection: "column"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid #E7E5E4", background: "rgba(217, 119, 6, 0.04)" }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "var(--color-primary-dark)" }}>
                ✏️ Editar Información de Local
              </h3>
              <button onClick={() => setEditingLugar(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#78716C", padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEdit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.85rem", overflowY: "auto", maxHeight: "80vh" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#78716C" }}>Nombre del Local</label>
                <input
                  type="text"
                  required
                  value={editingLugar.nombre}
                  onChange={(e) => setEditingLugar({ ...editingLugar, nombre: e.target.value })}
                  style={{ padding: "0.55rem 0.75rem", borderRadius: 10, border: "1px solid #E7E5E4", outline: "none", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#78716C" }}>Dirección</label>
                <input
                  type="text"
                  required
                  value={editingLugar.direccion}
                  onChange={(e) => setEditingLugar({ ...editingLugar, direccion: e.target.value })}
                  style={{ padding: "0.55rem 0.75rem", borderRadius: 10, border: "1px solid #E7E5E4", outline: "none", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#78716C" }}>Provincia Origen</label>
                <select
                  value={editingLugar.provincia_slug}
                  onChange={(e) => setEditingLugar({ ...editingLugar, provincia_slug: e.target.value })}
                  style={{ padding: "0.55rem 0.75rem", borderRadius: 10, border: "1px solid #E7E5E4", background: "white", outline: "none", fontSize: "0.9rem", cursor: "pointer" }}
                >
                  {PROVINCIAS.map((p) => (
                    <option key={p.slug} value={p.slug}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#78716C" }}>Teléfono de Contacto</label>
                <input
                  type="text"
                  value={editingLugar.telefono}
                  onChange={(e) => setEditingLugar({ ...editingLugar, telefono: e.target.value })}
                  style={{ padding: "0.55rem 0.75rem", borderRadius: 10, border: "1px solid #E7E5E4", outline: "none", fontSize: "0.9rem" }}
                />
              </div>

              {/* Coordinates Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#78716C" }}>Latitud (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingLugar.lat}
                    onChange={(e) => setEditingLugar({ ...editingLugar, lat: Number(e.target.value) })}
                    style={{ padding: "0.55rem 0.75rem", borderRadius: 10, border: "1px solid #E7E5E4", outline: "none", fontSize: "0.9rem" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#78716C" }}>Longitud (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingLugar.lng}
                    onChange={(e) => setEditingLugar({ ...editingLugar, lng: Number(e.target.value) })}
                    style={{ padding: "0.55rem 0.75rem", borderRadius: 10, border: "1px solid #E7E5E4", outline: "none", fontSize: "0.9rem" }}
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
