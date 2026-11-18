"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Search, Plus, Edit, Trash2, Eye, EyeOff, X } from "lucide-react";
import { PROVINCIAS } from "@/lib/seed-data";

interface PlatoRow {
  id: number;
  nombre: string;
  slug: string;
  provincia_slug: string;
  precio_referencial: number | null;
  destacado: boolean;
  activo: boolean;
  imagen_url: string | null;
}

export default function AdminPlatosPage() {
  const [search, setSearch] = useState("");
  const [platos, setPlatos] = useState<PlatoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [editingPlato, setEditingPlato] = useState<PlatoRow | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadPlatos = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/platos", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.success) {
        setPlatos(data.platos);
        setListError("");
      } else {
        setListError(data.error || "No se pudieron cargar los platos.");
      }
    } catch {
      setListError("Error de conexión al cargar los platos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlatos();
  }, [loadPlatos]);

  const filtered = platos.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const patchPlato = async (id: number, patch: Record<string, unknown>) => {
    const res = await fetch("/api/admin/platos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, ...patch }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Error al guardar");
  };

  const toggleActivo = async (plato: PlatoRow) => {
    try {
      await patchPlato(plato.id, { activo: !plato.activo });
      setPlatos((prev) => prev.map((p) => (p.id === plato.id ? { ...p, activo: !p.activo } : p)));
    } catch (e: any) {
      alert(e.message || "No se pudo actualizar.");
    }
  };

  const toggleDestacado = async (plato: PlatoRow) => {
    try {
      await patchPlato(plato.id, { destacado: !plato.destacado });
      setPlatos((prev) => prev.map((p) => (p.id === plato.id ? { ...p, destacado: !p.destacado } : p)));
    } catch (e: any) {
      alert(e.message || "No se pudo actualizar.");
    }
  };

  const handleDelete = async (plato: PlatoRow) => {
    if (!confirm(`¿Eliminar "${plato.nombre}"? Se borrarán también sus reseñas y vínculos.`)) return;
    try {
      const res = await fetch("/api/admin/platos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: plato.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "No se pudo eliminar.");
      setPlatos((prev) => prev.filter((p) => p.id !== plato.id));
    } catch (e: any) {
      alert(e.message || "No se pudo eliminar.");
    }
  };

  const handleEditClick = (plato: PlatoRow) => {
    setIsNew(false);
    setEditingPlato({ ...plato });
  };

  const handleCreatePlato = () => {
    setIsNew(true);
    setEditingPlato({
      id: 0,
      nombre: "",
      slug: "",
      provincia_slug: "cercado",
      precio_referencial: 0,
      destacado: false,
      activo: true,
      imagen_url: null,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlato) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        action: isNew ? "create" : "update",
        nombre: editingPlato.nombre,
        provincia_slug: editingPlato.provincia_slug,
        precio_referencial: editingPlato.precio_referencial,
        destacado: editingPlato.destacado,
        activo: editingPlato.activo,
        imagen_url: editingPlato.imagen_url,
      };
      if (!isNew) payload.id = editingPlato.id;

      const res = await fetch("/api/admin/platos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Error al guardar el plato.");

      setEditingPlato(null);
      await loadPlatos();
    } catch (e: any) {
      alert(e.message || "Error al guardar el plato.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setEditingPlato((prev) => (prev ? { ...prev, imagen_url: data.url } : prev));
      } else {
        alert("Error al subir la imagen: " + (data.error || "desconocido"));
      }
    } catch {
      alert("Error de conexión al subir la imagen.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Panel Admin
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "1.75rem", color: "var(--color-ink)" }}>
          Gestionar Platos ({filtered.length})
        </h1>
        <button onClick={handleCreatePlato} className="btn-primary" style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Plus size={16} /> Nuevo Plato
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar platos..."
          style={{
            width: "100%", padding: "0.65rem 0.9rem 0.65rem 2.5rem", borderRadius: 12,
            border: "1px solid var(--color-border)", background: "var(--color-bg-card)", fontSize: "0.9rem", outline: "none",
          }}
        />
      </div>

      {listError && (
        <div style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)", padding: "0.75rem 1rem", borderRadius: 12, marginBottom: "1rem", fontSize: "0.85rem" }}>
          {listError}
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--color-text-muted)" }}>Cargando platos...</p>
      ) : (
        <div style={{ overflowX: "auto" }} className="card">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--color-border)", textAlign: "left" }}>
                <th style={{ padding: "0.75rem 1rem", fontFamily: "var(--font-body)", fontWeight: 600 }}>Plato</th>
                <th style={{ padding: "0.75rem 1rem" }}>Provincia</th>
                <th style={{ padding: "0.75rem 1rem" }}>Precio</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Destacado</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Activo</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((plato) => (
                <tr key={plato.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                    <Link href={`/plato/${plato.slug}`} style={{ color: "var(--color-primary)", textDecoration: "none" }}>
                      {plato.nombre}
                    </Link>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--color-text-muted)" }}>{plato.provincia_slug}</td>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{plato.precio_referencial ?? "—"} Bs</td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                    <button onClick={() => toggleDestacado(plato)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>
                      {plato.destacado ? "⭐" : "☆"}
                    </button>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                    <button onClick={() => toggleActivo(plato)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                      {plato.activo ? <Eye size={18} color="var(--color-secondary)" /> : <EyeOff size={18} color="var(--color-text-muted)" />}
                    </button>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", alignItems: "center" }}>
                      <button onClick={() => handleEditClick(plato)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Editar">
                        <Edit size={16} color="var(--color-primary)" />
                      </button>
                      <button onClick={() => handleDelete(plato)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Eliminar">
                        <Trash2 size={16} color="#EF4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingPlato && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.4)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center", padding: "1.5rem"
        }}>
          <div style={{
            background: "var(--color-bg-card)", borderRadius: 16, border: "1px solid var(--color-border)",
            width: "100%", maxWidth: 500, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            overflow: "hidden", display: "flex", flexDirection: "column"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", background: "color-mix(in srgb, var(--color-primary) 4%, transparent)" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.15rem", color: "var(--color-primary-dark)" }}>
                {isNew ? "➕ Nuevo Plato Gastronómico" : "✏️ Editar Plato Gastronómico"}
              </h3>
              <button onClick={() => setEditingPlato(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.85rem", overflowY: "auto", maxHeight: "80vh" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
                <div style={{
                  width: 90, height: 90, borderRadius: 12, overflow: "hidden",
                  background: "var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center",
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
                    {uploading ? "Subiendo imagen..." : "Subir foto desde tu dispositivo"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    style={{ fontSize: "0.75rem", alignSelf: "center", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textAlign: "center" }}>o pega un enlace de internet abajo:</span>
                  <input
                    type="text"
                    placeholder="https://ejemplo.com/foto-plato.jpg"
                    value={editingPlato.imagen_url || ""}
                    onChange={(e) => setEditingPlato({ ...editingPlato, imagen_url: e.target.value })}
                    style={{ padding: "0.45rem 0.65rem", borderRadius: 8, border: "1px solid var(--color-border)", outline: "none", fontSize: "0.8rem", width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)" }}>Nombre del Plato</label>
                <input
                  type="text"
                  required
                  value={editingPlato.nombre}
                  onChange={(e) => setEditingPlato({ ...editingPlato, nombre: e.target.value })}
                  style={{ padding: "0.6rem 0.8rem", borderRadius: 10, border: "1px solid var(--color-border)", outline: "none", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)" }}>Provincia Origen</label>
                <select
                  value={editingPlato.provincia_slug}
                  onChange={(e) => setEditingPlato({ ...editingPlato, provincia_slug: e.target.value })}
                  style={{ padding: "0.6rem 0.8rem", borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-bg-card)", outline: "none", fontSize: "0.9rem", cursor: "pointer" }}
                >
                  {PROVINCIAS.map((p) => (
                    <option key={p.slug} value={p.slug}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)" }}>Precio Referencial (Bs)</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={editingPlato.precio_referencial ?? 0}
                  onChange={(e) => setEditingPlato({ ...editingPlato, precio_referencial: Number(e.target.value) })}
                  style={{ padding: "0.6rem 0.8rem", borderRadius: 10, border: "1px solid var(--color-border)", outline: "none", fontSize: "0.9rem" }}
                />
              </div>

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

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setEditingPlato(null)} className="btn-secondary" style={{ padding: "0.55rem 1rem", fontSize: "0.85rem" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving || uploading} className="btn-primary" style={{ padding: "0.55rem 1rem", fontSize: "0.85rem" }}>
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
