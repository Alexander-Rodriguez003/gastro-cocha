/**
 * Mock data layer — allows the app to run locally without Supabase.
 * In production, these functions query Supabase directly.
 */
import { PROVINCIAS, PLATOS, LUGARES, RESENAS_SEED } from './seed-data';
import type { Provincia, Plato, Lugar, Resena, LugarConPivot } from './types';

// ---- Provincias ----
let provinciaIdCounter = 1;
const provinciasDB: Provincia[] = PROVINCIAS.map(p => ({
  id: provinciaIdCounter++,
  nombre: p.nombre,
  slug: p.slug,
  descripcion: p.descripcion,
  centro_lat: p.centro_lat,
  centro_lng: p.centro_lng,
  zoom_mapa: p.zoom_mapa,
}));

function getProvinciaBySlug(slug: string) {
  return provinciasDB.find(p => p.slug === slug);
}

// ---- Platos ----
let platoIdCounter = 1;
const platosDB: Plato[] = PLATOS.map(p => {
  const prov = provinciasDB.find(pr => pr.slug === p.provincia_slug);
  return {
    id: platoIdCounter++,
    provincia_id: prov?.id ?? 1,
    nombre: p.nombre,
    slug: p.slug,
    descripcion: p.descripcion,
    historia: p.historia,
    ingredientes: p.ingredientes,
    precio_referencial: p.precio_referencial,
    destacado: p.destacado,
    activo: true,
    promedio_rating: 4.0 + Math.random() * 0.9,
    total_resenas: Math.floor(Math.random() * 20) + 3,
    imagen_url: p.imagen_url,
    provincia: prov,
  };
});

// ---- Lugares ----
let lugarIdCounter = 1;
const lugaresDB: Lugar[] = LUGARES.map(l => {
  const prov = provinciasDB.find(pr => pr.slug === l.provincia_slug);
  return {
    id: lugarIdCounter++,
    provincia_id: prov?.id ?? 1,
    nombre: l.nombre,
    slug: l.slug,
    direccion: l.direccion,
    referencia: l.referencia ?? null,
    telefono: l.telefono,
    sitio_web: null,
    lat: l.lat,
    lng: l.lng,
    activo: l.activo,
    aprobado: l.aprobado,
    contacto_propietario: null,
    nombre_propietario: null,
    email_propietario: null,
    descripcion: null,
    imagen_url: null,
    provincia: prov,
  };
});

// Build plato-lugar relations
type PlatoLugarPivot = { plato_id: number; lugar_id: number; precio_aproximado: number | null; especialidad: boolean };
const platoLugarPivots: PlatoLugarPivot[] = [];
LUGARES.forEach(l => {
  const lugar = lugaresDB.find(ld => ld.slug === l.slug);
  if (!lugar) return;
  l.platos_slugs.forEach(ps => {
    const plato = platosDB.find(pd => pd.slug === ps.slug);
    if (!plato) return;
    platoLugarPivots.push({
      plato_id: plato.id,
      lugar_id: lugar.id,
      precio_aproximado: ps.precio,
      especialidad: ps.especialidad,
    });
  });
});

// ---- Reseñas ----
let resenaIdCounter = 1;
const resenasDB: Resena[] = RESENAS_SEED.map(r => {
  const plato = platosDB.find(p => p.slug === r.plato_slug);
  return {
    id: resenaIdCounter++,
    user_id: 2,
    plato_id: plato?.id ?? 1,
    lugar_id: null,
    rating: r.rating,
    titulo: r.titulo,
    comentario: r.comentario,
    fecha_visita: null,
    is_approved: r.is_approved,
    user: { id: 2, name: 'Usuario Demo' },
  };
});

// =============================================
// Public API functions (mock implementations)
// =============================================

export async function getAllProvincias(): Promise<Provincia[]> {
  return provinciasDB;
}

export async function getProvinciaDetail(slug: string): Promise<{ provincia: Provincia; platos: Plato[] } | null> {
  const prov = getProvinciaBySlug(slug);
  if (!prov) return null;
  const platos = platosDB.filter(p => p.provincia_id === prov.id && p.activo);
  return { provincia: prov, platos };
}

export async function getPlatosDestacados(): Promise<Plato[]> {
  return platosDB.filter(p => p.destacado && p.activo);
}

export async function getPlatoDetail(slug: string): Promise<{ plato: Plato; lugares: LugarConPivot[]; resenas: Resena[] } | null> {
  const plato = platosDB.find(p => p.slug === slug);
  if (!plato) return null;

  const pivots = platoLugarPivots.filter(pl => pl.plato_id === plato.id);
  const lugares: LugarConPivot[] = pivots.map(pv => {
    const lugar = lugaresDB.find(l => l.id === pv.lugar_id)!;
    return { ...lugar, pivot: { precio_aproximado: pv.precio_aproximado, especialidad: pv.especialidad } };
  }).filter(l => l.aprobado && l.activo);

  const resenas = resenasDB.filter(r => r.plato_id === plato.id && r.is_approved);

  return { plato, lugares, resenas };
}

export async function getLugarDetail(slug: string): Promise<{ lugar: Lugar; platos: Plato[]; resenas: Resena[] } | null> {
  const lugar = lugaresDB.find(l => l.slug === slug);
  if (!lugar || !lugar.aprobado) return null;

  const pivots = platoLugarPivots.filter(pl => pl.lugar_id === lugar.id);
  const platos = pivots.map(pv => platosDB.find(p => p.id === pv.plato_id)!).filter(Boolean);
  const resenas = resenasDB.filter(r => r.lugar_id === lugar.id && r.is_approved);

  return { lugar, platos, resenas };
}

export async function getRankingGlobal(): Promise<Plato[]> {
  return [...platosDB]
    .filter(p => p.activo)
    .sort((a, b) => (b.promedio_rating ?? 0) - (a.promedio_rating ?? 0));
}

export async function getChatbotContext(lat?: number, lng?: number, budget?: number): Promise<string> {
  let results = platoLugarPivots.map(pv => {
    const plato = platosDB.find(p => p.id === pv.plato_id);
    const lugar = lugaresDB.find(l => l.id === pv.lugar_id);
    if (!plato || !lugar || !lugar.aprobado || !lugar.activo) return null;
    const prov = provinciasDB.find(pr => pr.id === plato.provincia_id);
    return { plato: plato.nombre, lugar: lugar.nombre, direccion: lugar.direccion, precio: pv.precio_aproximado, rating: plato.promedio_rating, lat: lugar.lat, lng: lugar.lng, provincia: prov?.nombre };
  }).filter(Boolean) as Array<{ plato: string; lugar: string; direccion: string | null; precio: number | null; rating: number | null; lat: number; lng: number; provincia: string | undefined }>;

  if (budget) {
    results = results.filter(r => r.precio !== null && r.precio <= budget);
  }

  if (lat && lng) {
    const { haversine } = await import('./utils');
    results = results.map(r => ({ ...r, distancia_km: haversine(lat, lng, r.lat, r.lng) }))
      .sort((a, b) => (a.distancia_km ?? 999) - (b.distancia_km ?? 999));
  }

  return results.slice(0, 15).map(r => {
    let line = `- ${r.plato} en "${r.lugar}" (${r.provincia})`;
    if (r.precio) line += ` | ${r.precio} Bs`;
    if (r.rating) line += ` | ★${r.rating.toFixed(1)}`;
    if ('distancia_km' in r) line += ` | ${(r as { distancia_km: number }).distancia_km.toFixed(1)} km`;
    if (r.direccion) line += ` | ${r.direccion}`;
    return line;
  }).join('\n');
}

// Admin stats
export async function getAdminStats() {
  return {
    totalPlatos: platosDB.filter(p => p.activo).length,
    totalLugares: lugaresDB.filter(l => l.aprobado).length,
    solicitudesPendientes: lugaresDB.filter(l => !l.aprobado).length,
    resenasPendientes: resenasDB.filter(r => !r.is_approved).length,
    totalProvincias: provinciasDB.length,
  };
}
