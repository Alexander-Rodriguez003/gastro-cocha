"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search, Plus, Edit, Trash2, Eye, EyeOff, X } from "lucide-react";
import { PLATOS, PROVINCIAS } from "@/lib/seed-data";

interface PlatoRow {
  nombre: string;
  slug: string;
  provincia_slug: string;
  precio_referencial: number;
  destacado: boolean;
  activo: boolean;
  imagen_url?: string | null;
}

export default function AdminPlatosPage() {
  const [search, setSearch] = useState("");
  const [platos, setPlatos] = useState<PlatoRow[]>(
    PLATOS.map((p: any) => ({
      nombre: p.nombre,
      slug: p.slug,
      provincia_slug: p.provincia_slug,
      precio_referencial: p.precio_referencial,
      destacado: p.destacado,
      activo: true,
      imagen_url: p.imagen_url || null,
    }))
  );

  const [editingPlato, setEditingPlato] = useState<PlatoRow | null>(null);

  const filtered = platos.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActivo = (slug: string) => {
    setPlatos((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, activo: !p.activo } : p))
    );
  };

  const toggleDestacado = (slug: string) => {
    setPlatos((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, destacado: !p.destacado } : p))
    );
  };

  const handleDelete = (slug: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este plato?")) {
      setPlatos((prev) => prev.filter((p) => p.slug !== slug));
    }
  };

  const handleEditClick = (plato: PlatoRow) => {
    setEditingPlato({ ...plato });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlato) return;

    setPlatos((prev) =>
      prev.map((p) => (p.slug === editingPlato.slug ? editingPlato : p))
    );
    setEditingPlato(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingPlato) {
          setEditingPlato({
            ...editingPlato,
            imagen_url: reader.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePlato = () => {
    const nuevoSlug = `nuevo-plato-${Date.now()}`;
    const nuevo: PlatoRow = {
      nombre: "Nuevo Plato Gastronómico",
      slug: nuevoSlug,
      provincia_slug: "cercado",
      precio_referencial: 25,
      destacado: false,
      activo: true,
      imagen_url: null,
    };
    setPlatos((prev) => [nuevo, ...prev]);
    setEditingPlato(nuevo);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 4, color: "#78716C", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Panel Admin
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "1.75rem" }}>
          🍽️ Gestionar Platos ({filtered.length})
        </h1>
        <button onClick={handleCreatePlato} className="btn-primary" style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Plus size={16} /> Nuevo Plato
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#78716C" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar platos..."
          style={{
            width: "100%", padding: "0.65rem 0.9rem 0.65rem 2.5rem", borderRadius: 12,
            border: "1px solid #E7E5E4", background: "#FFFBF5", fontSize: "0.9rem", outline: "none",
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }} className="card">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E7E5E4", textAlign: "left" }}>
              <th style={{ padding: "0.75rem 1rem", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Plato</th>
              <th style={{ padding: "0.75rem 1rem" }}>Provincia</th>
              <th style={{ padding: "0.75rem 1rem" }}>Precio</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Destacado</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Activo</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((plato) => (
              <tr key={plato.slug} style={{ borderBottom: "1px solid #E7E5E4" }}>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                  <Link href={`/plato/${plato.slug}`} style={{ color: "#D97706", textDecoration: "none" }}>
                    {plato.nombre}
                  </Link>
                </td>
                <td style={{ padding: "0.75rem 1rem", color: "#78716C" }}>{plato.provincia_slug}</td>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{plato.precio_referencial} Bs</td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                  <button onClick={() => toggleDestacado(plato.slug)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>
                    {plato.destacado ? "⭐" : "☆"}
                  </button>
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                  <button onClick={() => toggleActivo(plato.slug)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    {plato.activo ? <Eye size={18} color="#059669" /> : <EyeOff size={18} color="#78716C" />}
                  </button>
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", alignItems: "center" }}>
                    <button onClick={() => handleEditClick(plato)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Editar">
                      <Edit size={16} color="#D97706" />
                    </button>
                    <button onClick={() => handleDelete(plato.slug)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Eliminar">
                      <Trash2 size={16} color="#EF4444" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal Popup */}
      {editingPlato && (
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
                ✏️ Editar Plato Gastronómico
              </h3>
              <button onClick={() => setEditingPlato(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#78716C", padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEdit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.85rem", overflowY: "auto", maxHeight: "80vh" }}>
              {/* Image Preview & Upload */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
                <div style={{
                  width: 90, height: 90, borderRadius: 12, overflow: "hidden",
                  background: "#E7E5E4", display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px dashed rgba(217, 119, 6, 0.3)"
                }}>
                  {editingPlato.imagen_url ? (
                    <img src={editingPlato.imagen_url} alt="Vista previa" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "2rem" }}>🍽️</span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary-dark)", textAlign: "center" }}>
                    Subir foto desde tu PC
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ fontSize: "0.75rem", alignSelf: "center", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.7rem", color: "#78716C", textAlign: "center" }}>o pega un enlace de internet abajo:</span>
                  <input
                    type="text"
                    placeholder="https://ejemplo.com/foto-plato.jpg"
                    value={editingPlato.imagen_url || ""}
                    onChange={(e) => setEditingPlato({ ...editingPlato, imagen_url: e.target.value })}
                    style={{ padding: "0.45rem 0.65rem", borderRadius: 8, border: "1px solid #E7E5E4", outline: "none", fontSize: "0.8rem", width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#78716C" }}>Nombre del Plato</label>
                <input
                  type="text"
                  required
                  value={editingPlato.nombre}
                  onChange={(e) => setEditingPlato({ ...editingPlato, nombre: e.target.value })}
                  style={{ padding: "0.6rem 0.8rem", borderRadius: 10, border: "1px solid #E7E5E4", outline: "none", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#78716C" }}>Provincia Origen</label>
                <select
                  value={editingPlato.provincia_slug}
                  onChange={(e) => setEditingPlato({ ...editingPlato, provincia_slug: e.target.value })}
                  style={{ padding: "0.6rem 0.8rem", borderRadius: 10, border: "1px solid #E7E5E4", background: "#white", outline: "none", fontSize: "0.9rem", cursor: "pointer" }}
                >
                  {PROVINCIAS.map((p) => (
                    <option key={p.slug} value={p.slug}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#78716C" }}>Precio Referencial (Bs)</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={editingPlato.precio_referencial}
                  onChange={(e) => setEditingPlato({ ...editingPlato, precio_referencial: Number(e.target.value) })}
                  style={{ padding: "0.6rem 0.8rem", borderRadius: 10, border: "1px solid #E7E5E4", outline: "none", fontSize: "0.9rem" }}
                />
              </div>

              {/* Switches */}
              <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", cursor: "pointer", fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={editingPlato.destacado}
                    onChange={(e) => setEditingPlato({ ...editingPlato, destacado: e.target.checked })}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  ⭐ Destacado
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", cursor: "pointer", fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={editingPlato.activo}
                    onChange={(e) => setEditingPlato({ ...editingPlato, activo: e.target.checked })}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  👁️ Activo
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setEditingPlato(null)} className="btn-secondary" style={{ padding: "0.55rem 1rem", fontSize: "0.85rem" }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ padding: "0.55rem 1rem", fontSize: "0.85rem" }}>
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
