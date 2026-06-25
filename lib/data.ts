/**
 * Mock data layer — allows the app to run locally without Supabase.
 * In production, these functions query Supabase directly.
 */
import { PROVINCIAS, PLATOS, LUGARES, RESENAS_SEED } from './seed-data';
import type { Provincia, Plato, Lugar, Resena, LugarConPivot } from './types';
import { loadJSONData, saveJSONData } from "./db_helper";

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
const defaultPlatos: Plato[] = PLATOS.map(p => {
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
const defaultLugares: Lugar[] = LUGARES.map(l => {
  const prov = provinciasDB.find(pr => pr.slug === l.provincia_slug);
  let email = null;
  if (l.slug === "el-palacio-del-silpancho") {
    email = "silpancho@elpalaciodelsilpancho.com";
  }
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
    email_propietario: email,
    descripcion: null,
    imagen_url: null,
    provincia: prov,
    especialidades: l.slug === "el-palacio-del-silpancho" ? [
      {
        id: 55001,
        nombre: "Cappuccino de Invierno",
        precio: 18.0,
        imagen_url: null,
        total_resenas: 0,
        promedio_rating: null
      }
    ] : []
  };
});

// Build plato-lugar relations
type PlatoLugarPivot = { plato_id: number; lugar_id: number; precio_aproximado: number | null; especialidad: boolean; imagen_url?: string | null };
const defaultPlatoLugarPivots: PlatoLugarPivot[] = [];
LUGARES.forEach(l => {
  const lugar = defaultLugares.find(ld => ld.slug === l.slug);
  if (!lugar) return;
  l.platos_slugs.forEach(ps => {
    const plato = defaultPlatos.find(pd => pd.slug === ps.slug);
    if (!plato) return;
    defaultPlatoLugarPivots.push({
      plato_id: plato.id,
      lugar_id: lugar.id,
      precio_aproximado: ps.precio,
      especialidad: ps.especialidad,
      imagen_url: null
    });
  });
});

// ---- Reseñas ----
let resenaIdCounter = 1;
const defaultResenas: Resena[] = RESENAS_SEED.map((r, index) => {
  const plato = defaultPlatos.find(p => p.slug === r.plato_slug);
  
  // Distribuir las reseñas en los últimos 60 días a partir de la fecha de la sesión
  const date = new Date("2026-06-24T12:00:00Z");
  date.setDate(date.getDate() - (index % 60));
  const dateStr = date.toISOString().split('T')[0];

  return {
    id: resenaIdCounter++,
    user_id: 2,
    plato_id: plato?.id ?? 1,
    lugar_id: null,
    rating: r.rating,
    titulo: r.titulo,
    comentario: r.comentario,
    fecha_visita: dateStr,
    is_approved: r.is_approved,
    user: { id: 2, name: 'Usuario Demo' },
  };
});

// Add pending reviews for testing
defaultResenas.push(
  {
    id: 100,
    user_id: 3,
    plato_id: 1,
    lugar_id: null,
    rating: 2,
    titulo: "No me gustó",
    comentario: "La carne estaba muy delgada y sin sabor.",
    fecha_visita: null,
    is_approved: false,
    user: { id: 3, name: "Carlos P." }
  },
  {
    id: 101,
    user_id: 4,
    plato_id: 4,
    lugar_id: null,
    rating: 5,
    titulo: "Excelente atención",
    comentario: "Doña Rosa atiende como en casa. La mejor pensión de Cochabamba sin duda.",
    fecha_visita: null,
    is_approved: false,
    user: { id: 4, name: "María L." }
  }
);

// ---- Solicitudes predeterminadas ----
const defaultSolicitudes = [
  {
    id: 1, nombre: "Comedor Doña Juana", direccion: "Carretera Cbba-Oruro Km 15, al lado del puente",
    telefono: "+591 71222333", nombre_propietario: "Juana Mamani", email_propietario: "juana@comedordonajuana.com",
    provincia: "Quillacollo", lat: -17.41, lng: -66.35, platos_que_sirve: "Fricasé, Chicharrón, Trancapecho",
    especialidades: "Fricasé Especial de la Casa", fecha: "2026-05-20", status: "pendiente" as const,
  },
  {
    id: 2, nombre: "Truchas El Paraíso", direccion: "Entrada a Villa Tunari, curva del río",
    telefono: "+591 71444555", nombre_propietario: "Carlos Quispe", email_propietario: "carlos@truchaselparaiso.com",
    provincia: "Chapare", lat: -16.98, lng: -65.42, platos_que_sirve: "Trucha frita, Tambaquí, Surubí",
    especialidades: "Tambaquí a la Leña", fecha: "2026-05-21", status: "pendiente" as const,
  },
];

// Carga o inicialización
export let platosDB: Plato[] = defaultPlatos;
export let lugaresDB: Lugar[] = defaultLugares;
export let platoLugarPivots: PlatoLugarPivot[] = defaultPlatoLugarPivots;
export let resenasDB: Resena[] = defaultResenas;
export let solicitudesDB: any[] = defaultSolicitudes;

export function reloadData() {
  const persisted = loadJSONData();
  if (persisted) {
    if (persisted.platos) {
      // Always sync imagen_url from seed data — prevents stale null values
      // when images are added after the database.json was first saved
      platosDB = persisted.platos.map((p: Plato) => {
        const seed = defaultPlatos.find(d => d.slug === p.slug);
        return seed?.imagen_url && !p.imagen_url
          ? { ...p, imagen_url: seed.imagen_url }
          : p;
      });
    }
    if (persisted.lugares) lugaresDB = persisted.lugares;
    if (persisted.platoLugarPivots) platoLugarPivots = persisted.platoLugarPivots;
    if (persisted.resenas) resenasDB = persisted.resenas;
    if (persisted.solicitudes) solicitudesDB = persisted.solicitudes;
  }
}


// Initial load
reloadData();

export function saveAllData() {
  saveJSONData({
    platos: platosDB,
    lugares: lugaresDB,
    platoLugarPivots: platoLugarPivots,
    resenas: resenasDB,
    solicitudes: solicitudesDB,
  });
}

const persisted = loadJSONData();
if (!persisted || !persisted.lugares) {
  saveAllData();
}

// =============================================
// Public API functions (mock implementations)
// =============================================

export async function getAllProvincias(): Promise<Provincia[]> {
  return provinciasDB;
}

export async function getProvinciaDetail(slug: string): Promise<{ provincia: Provincia; platos: Plato[] } | null> {
  reloadData();
  const prov = getProvinciaBySlug(slug);
  if (!prov) return null;
  const platos = platosDB.filter(p => p.provincia_id === prov.id && p.activo);
  return { provincia: prov, platos };
}

export async function getPlatosDestacados(): Promise<Plato[]> {
  reloadData();
  return platosDB.filter(p => p.destacado && p.activo);
}

export async function getPlatoDetail(slug: string): Promise<{ plato: Plato; lugares: LugarConPivot[]; resenas: Resena[] } | null> {
  reloadData();
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

export async function getLugarDetail(slug: string): Promise<{ lugar: Lugar; platos: any[]; resenas: Resena[] } | null> {
  reloadData();
  const lugar = lugaresDB.find(l => l.slug === slug);
  if (!lugar || !lugar.aprobado) return null;

  const pivots = platoLugarPivots.filter(pl => pl.lugar_id === lugar.id);
  const platos = pivots.map(pv => {
    const plato = platosDB.find(p => p.id === pv.plato_id);
    if (!plato) return null;
    return {
      ...plato,
      pivot: {
        precio_aproximado: pv.precio_aproximado,
        especialidad: pv.especialidad,
        imagen_url: (pv as any).imagen_url || null
      }
    };
  }).filter(Boolean);

  const resenas = resenasDB.filter(r => r.lugar_id === lugar.id && r.is_approved);

  return { lugar, platos, resenas };
}

export async function getRankingGlobal(): Promise<any[]> {
  reloadData();
  // 1. Get typical dishes with dynamic rating recalculation
  const typicalRankings = platosDB.filter(p => p.activo).map(p => {
    const reviews = resenasDB.filter(r => r.plato_id === p.id && r.is_approved);
    const count = reviews.length;
    const avg = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : p.promedio_rating;
    return {
      id: p.id,
      nombre: p.nombre,
      slug: p.slug,
      descripcion: p.descripcion,
      promedio_rating: avg,
      total_resenas: count,
      imagen_url: p.imagen_url,
      es_especialidad: false,
    };
  });

  // 2. Compile custom specialties from places
  const specialtiesMap = new Map<string, { nombre: string; reviews: number[]; lugaresIds: number[] }>();

  // Collect from reviews that have specialty_nombre
  resenasDB.filter(r => r.is_approved && r.especialidad_nombre).forEach(r => {
    const name = r.especialidad_nombre!.trim();
    const key = name.toLowerCase();
    if (!specialtiesMap.has(key)) {
      specialtiesMap.set(key, { nombre: name, reviews: [], lugaresIds: [] });
    }
    const item = specialtiesMap.get(key)!;
    item.reviews.push(r.rating);
    if (r.lugar_id && !item.lugaresIds.includes(r.lugar_id)) {
      item.lugaresIds.push(r.lugar_id);
    }
  });

  // Also collect any registered specialties in places even if they don't have reviews yet
  lugaresDB.forEach(l => {
    if (l.especialidades) {
      l.especialidades.forEach(esp => {
        const key = esp.nombre.toLowerCase();
        if (!specialtiesMap.has(key)) {
          specialtiesMap.set(key, { nombre: esp.nombre, reviews: [], lugaresIds: [] });
        }
        const item = specialtiesMap.get(key)!;
        if (!item.lugaresIds.includes(l.id)) {
          item.lugaresIds.push(l.id);
        }
      });
    }
  });

  const specialtyRankings = Array.from(specialtiesMap.values()).map((sp, idx) => {
    const count = sp.reviews.length;
    const avg = count > 0 ? sp.reviews.reduce((sum, r) => sum + r, 0) / count : 4.0; // default 4.0

    // Find highest rated restaurant offering this specialty
    let bestLugar: Lugar | null = null;
    let maxRating = -1;
    let customImage: string | null = null;

    sp.lugaresIds.forEach(lId => {
      const lugar = lugaresDB.find(l => l.id === lId);
      if (lugar) {
        const lReviews = resenasDB.filter(r => r.lugar_id === lugar.id && r.is_approved);
        const lAvg = lReviews.length > 0 ? lReviews.reduce((sum, r) => sum + r.rating, 0) / lReviews.length : 4.0;
        
        const espObj = lugar.especialidades?.find(e => e.nombre.toLowerCase() === sp.nombre.toLowerCase());
        const espImg = espObj?.imagen_url || lugar.imagen_url;

        if (lAvg > maxRating) {
          maxRating = lAvg;
          bestLugar = lugar;
          customImage = espImg;
        }
      }
    });

    return {
      id: 10000 + idx,
      nombre: sp.nombre,
      slug: sp.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      descripcion: `Especialidad de la casa, destacada en: ${bestLugar ? (bestLugar as Lugar).nombre : "Varios locales"}.`,
      promedio_rating: avg,
      total_resenas: count,
      imagen_url: customImage || "/images/placeholder-plate.jpg",
      es_especialidad: true,
      lugar_slug: bestLugar ? (bestLugar as Lugar).slug : null,
    };
  });

  // Combine and sort by rating descending, then by reviews count
  return [...typicalRankings, ...specialtyRankings]
    .sort((a, b) => {
      const rA = a.promedio_rating ?? 0;
      const rB = b.promedio_rating ?? 0;
      if (rB !== rA) return rB - rA;
      return b.total_resenas - a.total_resenas;
    });
}

export async function getChatbotContext(lat?: number, lng?: number, budget?: number): Promise<string> {
  reloadData();
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
export async function getStaticGastroDatabase(): Promise<string> {
  reloadData();
  const result: string[] = [];
  provinciasDB.forEach(prov => {
    const provPlatos = platosDB.filter(p => p.provincia_id === prov.id);
    if (provPlatos.length > 0) {
      const platosList = provPlatos.map(p => p.nombre).join(", ");
      result.push(`- Provincia ${prov.nombre}: ${platosList}`);
    } else {
      result.push(`- Provincia ${prov.nombre}: (Sin platos típicos registrados aún)`);
    }
  });
  return result.join("\n");
}

// ---- Solicitudes de Registro (Server-side in-memory store) ----
export interface Solicitud {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  nombre_propietario: string;
  email_propietario: string | null;
  provincia: string;
  lat: number;
  lng: number;
  platos_que_sirve: string;
  especialidades: string | null;
  fecha: string;
  status: "pendiente" | "aprobado" | "rechazado";
}

export async function getSolicitudes(): Promise<Solicitud[]> {
  reloadData();
  return solicitudesDB;
}

export async function createSolicitud(data: Omit<Solicitud, "id" | "fecha" | "status">): Promise<Solicitud> {
  reloadData();
  const newId = solicitudesDB.length > 0 ? Math.max(...solicitudesDB.map(s => s.id)) + 1 : 1;
  const newSol: Solicitud = {
    ...data,
    id: newId,
    fecha: new Date().toISOString().split("T")[0],
    status: "pendiente"
  };
  solicitudesDB.push(newSol);
  saveAllData();
  return newSol;
}

export async function updateSolicitudStatus(id: number, status: "aprobado" | "rechazado"): Promise<boolean> {
  reloadData();
  const sol = solicitudesDB.find(s => s.id === id);
  if (!sol) return false;
  sol.status = status;

  if (status === "aprobado") {
    // Dynamically insert into lugaresDB!
    const newLugarId = lugaresDB.length > 0 ? Math.max(...lugaresDB.map(l => l.id)) + 1 : 1;
    const slug = sol.nombre.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const prov = provinciasDB.find(p => p.nombre.toLowerCase() === sol.provincia.toLowerCase()) || provinciasDB[0];

    const especialidadesList = sol.especialidades
      ? sol.especialidades.split(",").map((esp: string, i: number) => ({
          id: 50000 + i + Math.floor(Math.random() * 1000),
          nombre: esp.trim(),
          precio: 25.0,
          imagen_url: null,
          total_resenas: 0,
          promedio_rating: null,
        }))
      : [];

    const newLugar: Lugar = {
      id: newLugarId,
      provincia_id: prov.id,
      nombre: sol.nombre,
      slug,
      direccion: sol.direccion,
      referencia: null,
      telefono: sol.telefono,
      sitio_web: null,
      lat: sol.lat,
      lng: sol.lng,
      activo: true,
      aprobado: true,
      contacto_propietario: sol.nombre_propietario,
      nombre_propietario: sol.nombre_propietario,
      email_propietario: sol.email_propietario,
      descripcion: null,
      imagen_url: null,
      provincia: prov,
      especialidades: especialidadesList,
    };
    lugaresDB.push(newLugar);

    // Map plates associated with this restaurant
    const platosList = sol.platos_que_sirve.split(",").map((p: string) => p.trim().toLowerCase());
    platosList.forEach((platoName: string) => {
      const plato = platosDB.find(p => p.nombre.toLowerCase().includes(platoName) || platoName.includes(p.nombre.toLowerCase()));
      if (plato) {
        platoLugarPivots.push({
          plato_id: plato.id,
          lugar_id: newLugar.id,
          precio_aproximado: plato.precio_referencial,
          especialidad: false,
          imagen_url: null
        } as any);
      }
    });
  }
  saveAllData();
  return true;
}

export async function getReviewsAdmin(): Promise<Resena[]> {
  reloadData();
  return resenasDB;
}

export async function updateReviewStatus(id: number, approve: boolean): Promise<boolean> {
  reloadData();
  const resena = resenasDB.find(r => r.id === id);
  if (!resena) return false;
  resena.is_approved = approve;
  (resena as any).reviewed = true;
  saveAllData();
  return true;
}

// Admin stats
export async function getAdminStats() {
  reloadData();
  return {
    totalPlatos: platosDB.filter(p => p.activo).length,
    totalLugares: lugaresDB.filter(l => l.aprobado).length,
    solicitudesPendientes: solicitudesDB.filter(s => s.status === "pendiente").length,
    resenasPendientes: resenasDB.filter(r => !r.is_approved && !(r as any).reviewed).length,
    totalProvincias: provinciasDB.length,
  };
}

export async function getLugaresByProvincia(provinciaSlug?: string): Promise<Lugar[]> {
  reloadData();
  if (!provinciaSlug) {
    return lugaresDB.filter(l => l.aprobado && l.activo);
  }
  const prov = getProvinciaBySlug(provinciaSlug);
  if (!prov) return [];
  return lugaresDB.filter(l => l.provincia_id === prov.id && l.aprobado && l.activo);
}

export async function getAllLugaresAdmin(): Promise<Lugar[]> {
  reloadData();
  return lugaresDB.filter(l => l.aprobado);
}

export async function getProvinciaPorCoordenadas(lat: number, lng: number): Promise<Provincia | null> {
  const { isWithinCochabamba } = await import("./utils");
  if (!isWithinCochabamba(lat, lng)) {
    return null;
  }

  const activeProvincias = provinciasDB.filter(p => p.centro_lat !== null && p.centro_lng !== null);
  if (activeProvincias.length === 0) return null;

  let nearestProv: Provincia | null = null;
  let minDist = Infinity;

  activeProvincias.forEach(p => {
    const dx = lat - (p.centro_lat ?? 0);
    const dy = lng - (p.centro_lng ?? 0);
    const dist = dx * dx + dy * dy; // fast squared distance
    if (dist < minDist) {
      minDist = dist;
      nearestProv = p;
    }
  });

  return nearestProv;
}

export async function getLugarByOwnerEmail(email: string): Promise<Lugar | null> {
  reloadData();
  const lugar = lugaresDB.find(l => l.email_propietario?.toLowerCase() === email.toLowerCase());
  if (!lugar) return null;
  return lugar;
}

export async function updateLugarDetails(
  lugarId: number,
  data: { telefono: string; direccion: string; descripcion: string; imagen_url?: string }
): Promise<boolean> {
  reloadData();
  const lugar = lugaresDB.find(l => l.id === lugarId);
  if (!lugar) return false;
  lugar.telefono = data.telefono;
  lugar.direccion = data.direccion;
  lugar.descripcion = data.descripcion;
  if (data.imagen_url) {
    lugar.imagen_url = data.imagen_url;
  }
  saveAllData();
  return true;
}

export async function updateLugarOwnerEmail(lugarId: number, email: string): Promise<boolean> {
  reloadData();
  const lugar = lugaresDB.find(l => l.id === lugarId);
  if (!lugar) return false;
  lugar.email_propietario = email;
  saveAllData();
  return true;
}

export async function updatePlatoLugarPivot(
  lugarId: number,
  platoId: number,
  data: { precio_aproximado: number; imagen_url?: string }
): Promise<boolean> {
  reloadData();
  const pivot = platoLugarPivots.find(p => p.lugar_id === lugarId && p.plato_id === platoId);
  if (!pivot) {
    const newPivot = {
      lugar_id: lugarId,
      plato_id: platoId,
      precio_aproximado: data.precio_aproximado,
      especialidad: false,
      imagen_url: data.imagen_url || null
    } as any;
    platoLugarPivots.push(newPivot);
  } else {
    pivot.precio_aproximado = data.precio_aproximado;
    if (data.imagen_url !== undefined) {
      (pivot as any).imagen_url = data.imagen_url;
    }
  }
  saveAllData();
  return true;
}

export async function addSpecialty(
  lugarId: number,
  data: { nombre: string; precio: number; imagen_url?: string }
): Promise<boolean> {
  reloadData();
  const lugar = lugaresDB.find(l => l.id === lugarId);
  if (!lugar) return false;
  
  if (!lugar.especialidades) {
    lugar.especialidades = [];
  }
  const newId = 50000 + lugar.especialidades.length + Math.floor(Math.random() * 1000);
  lugar.especialidades.push({
    id: newId,
    nombre: data.nombre,
    precio: data.precio,
    imagen_url: data.imagen_url || null,
    total_resenas: 0,
    promedio_rating: null,
  });
  saveAllData();
  return true;
}

export async function deleteSpecialty(lugarId: number, specialtyId: number): Promise<boolean> {
  reloadData();
  const lugar = lugaresDB.find(l => l.id === lugarId);
  if (!lugar || !lugar.especialidades) return false;
  lugar.especialidades = lugar.especialidades.filter(e => e.id !== specialtyId);
  saveAllData();
  return true;
}

export async function getTrendingGlobal(): Promise<any[]> {
  reloadData();
  const referenceDate = new Date("2026-06-24T12:00:00Z");

  const calculateHotScore = (reviews: Resena[]) => {
    let score = 0;
    reviews.forEach(r => {
      if (!r.fecha_visita) return;
      const rDate = new Date(r.fecha_visita);
      const diffMs = referenceDate.getTime() - rDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays < 0 || diffDays > 45) return; // ignore older than 45 days

      // weight decay: 15 days is 1.0, 16-45 days is 0.3
      const weight = diffDays <= 15 ? 1.0 : 0.3;
      score += r.rating * weight;
    });
    return score;
  };

  // 1. Get typical dishes
  const typicalRankings = platosDB.filter(p => p.activo).map(p => {
    const reviews = resenasDB.filter(r => r.plato_id === p.id && r.is_approved);
    const count = reviews.length;
    const avg = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : p.promedio_rating;
    
    const hotScore = calculateHotScore(reviews);

    return {
      id: p.id,
      nombre: p.nombre,
      slug: p.slug,
      descripcion: p.descripcion,
      promedio_rating: avg,
      total_resenas: count,
      imagen_url: p.imagen_url,
      es_especialidad: false,
      hot_score: hotScore,
    };
  });

  // 2. Compile custom specialties
  const specialtiesMap = new Map<string, { nombre: string; reviews: Resena[]; lugaresIds: number[] }>();

  resenasDB.filter(r => r.is_approved && r.especialidad_nombre).forEach(r => {
    const name = r.especialidad_nombre!.trim();
    const key = name.toLowerCase();
    if (!specialtiesMap.has(key)) {
      specialtiesMap.set(key, { nombre: name, reviews: [], lugaresIds: [] });
    }
    const item = specialtiesMap.get(key)!;
    item.reviews.push(r);
    if (r.lugar_id && !item.lugaresIds.includes(r.lugar_id)) {
      item.lugaresIds.push(r.lugar_id);
    }
  });

  lugaresDB.forEach(l => {
    if (l.especialidades) {
      l.especialidades.forEach(esp => {
        const key = esp.nombre.toLowerCase();
        if (!specialtiesMap.has(key)) {
          specialtiesMap.set(key, { nombre: esp.nombre, reviews: [], lugaresIds: [] });
        }
        const item = specialtiesMap.get(key)!;
        if (!item.lugaresIds.includes(l.id)) {
          item.lugaresIds.push(l.id);
        }
      });
    }
  });

  const specialtyRankings = Array.from(specialtiesMap.values()).map((sp, idx) => {
    const reviews = sp.reviews;
    const count = reviews.length;
    const avg = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 4.0;
    
    const hotScore = calculateHotScore(reviews);

    let bestLugar: Lugar | null = null;
    let maxRating = -1;
    let customImage: string | null = null;

    sp.lugaresIds.forEach(lId => {
      const lugar = lugaresDB.find(l => l.id === lId);
      if (lugar) {
        const lReviews = resenasDB.filter(r => r.lugar_id === lugar.id && r.is_approved);
        const lAvg = lReviews.length > 0 ? lReviews.reduce((sum, r) => sum + r.rating, 0) / lReviews.length : 4.0;
        
        const espObj = lugar.especialidades?.find(e => e.nombre.toLowerCase() === sp.nombre.toLowerCase());
        const espImg = espObj?.imagen_url || lugar.imagen_url;

        if (lAvg > maxRating) {
          maxRating = lAvg;
          bestLugar = lugar;
          customImage = espImg;
        }
      }
    });

    return {
      id: 10000 + idx,
      nombre: sp.nombre,
      slug: sp.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      descripcion: `Especialidad de la casa, destacada en: ${bestLugar ? (bestLugar as Lugar).nombre : "Varios locales"}.`,
      promedio_rating: avg,
      total_resenas: count,
      imagen_url: customImage || "/images/placeholder-plate.jpg",
      es_especialidad: true,
      lugar_slug: bestLugar ? (bestLugar as Lugar).slug : null,
      hot_score: hotScore,
    };
  });

  return [...typicalRankings, ...specialtyRankings]
    .sort((a, b) => b.hot_score - a.hot_score);
}

