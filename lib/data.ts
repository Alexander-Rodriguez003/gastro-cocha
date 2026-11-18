import { cache } from 'react';
import { getServiceSupabase } from './supabase';
import type { Provincia, Plato, Lugar, Resena, LugarConPivot, PlatoConPivot, Especialidad } from './types';

const db = () => getServiceSupabase();

function mapProvincia(row: any): Provincia {
  return {
    id: row.id,
    nombre: row.nombre,
    slug: row.slug,
    descripcion: row.descripcion,
    centro_lat: row.centro_lat ? Number(row.centro_lat) : null,
    centro_lng: row.centro_lng ? Number(row.centro_lng) : null,
    zoom_mapa: row.zoom_mapa,
    created_at: row.created_at,
  };
}

function mapPlato(row: any): Plato {
  return {
    id: row.id,
    provincia_id: row.provincia_id,
    nombre: row.nombre,
    slug: row.slug,
    descripcion: row.descripcion,
    historia: row.historia,
    ingredientes: row.ingredientes,
    precio_referencial: row.precio_referencial ? Number(row.precio_referencial) : null,
    destacado: row.destacado,
    activo: row.activo,
    promedio_rating: row.promedio_rating ? Number(row.promedio_rating) : null,
    total_resenas: row.total_resenas ?? 0,
    imagen_url: row.imagen_url,
    created_at: row.created_at,
    provincia: row.provincias ? mapProvincia(row.provincias) : undefined,
  };
}

function mapLugar(row: any): Lugar {
  return {
    id: row.id,
    provincia_id: row.provincia_id,
    nombre: row.nombre,
    slug: row.slug,
    direccion: row.direccion,
    referencia: row.referencia,
    telefono: row.telefono,
    sitio_web: row.sitio_web,
    lat: Number(row.lat),
    lng: Number(row.lng),
    activo: row.activo,
    aprobado: row.aprobado,
    contacto_propietario: row.contacto_propietario,
    nombre_propietario: row.nombre_propietario,
    email_propietario: row.email_propietario,
    descripcion: row.descripcion,
    imagen_url: row.imagen_url,
    created_at: row.created_at,
    provincia: row.provincias ? mapProvincia(row.provincias) : undefined,
    especialidades: row.especialidades ?? [],
  };
}

function mapResena(row: any): Resena {
  return {
    id: row.id,
    user_id: row.user_id,
    plato_id: row.plato_id,
    lugar_id: row.lugar_id,
    rating: row.rating,
    titulo: row.titulo,
    comentario: row.comentario,
    fecha_visita: row.fecha_visita,
    is_approved: row.is_approved,
    created_at: row.created_at,
    especialidad_nombre: row.especialidad_nombre,
    user: row.users ? { id: row.users.id, name: row.users.name } : undefined,
    plato: row.platos ? mapPlato(row.platos) : undefined,
    lugar: row.lugares ? mapLugar(row.lugares) : undefined,
  };
}

export async function getAllProvincias(): Promise<Provincia[]> {
  const { data, error } = await db().from('provincias').select('*').order('nombre');
  if (error) throw error;
  return (data || []).map(mapProvincia);
}

export const getProvinciaDetail = cache(async (slug: string): Promise<{ provincia: Provincia; platos: Plato[] } | null> => {
  const { data: prov, error } = await db().from('provincias').select('*').eq('slug', slug).single();
  if (error || !prov) return null;
  const { data: platos } = await db().from('platos').select('*').eq('provincia_id', prov.id).eq('activo', true);
  return { provincia: mapProvincia(prov), platos: (platos || []).map(mapPlato) };
});

export async function getPlatosDestacados(): Promise<Plato[]> {
  const { data, error } = await db().from('platos').select('*, provincias(*)').eq('destacado', true).eq('activo', true);
  if (error) throw error;
  return (data || []).map(mapPlato);
}

export const getPlatoDetail = cache(async (slug: string): Promise<{ plato: Plato; lugares: LugarConPivot[]; resenas: Resena[] } | null> => {
  const { data: plato, error } = await db().from('platos').select('*, provincias(*)').eq('slug', slug).single();
  if (error || !plato) return null;

  const { data: pivots } = await db()
    .from('plato_lugar')
    .select('*, lugares(*)')
    .eq('plato_id', plato.id);

  const lugares: LugarConPivot[] = (pivots || [])
    .filter((pv: any) => pv.lugares?.aprobado && pv.lugares?.activo)
    .map((pv: any) => ({
      ...mapLugar(pv.lugares),
      pivot: {
        precio_aproximado: pv.precio_aproximado ? Number(pv.precio_aproximado) : null,
        especialidad: pv.especialidad,
        imagen_url: pv.imagen_url || null,
      },
    }));

  const { data: resenas } = await db()
    .from('resenas')
    .select('*, users(id, name)')
    .eq('plato_id', plato.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  return { plato: mapPlato(plato), lugares, resenas: (resenas || []).map(mapResena) };
});

export const getLugarDetail = cache(async (slug: string): Promise<{ lugar: Lugar; platos: any[]; resenas: Resena[] } | null> => {
  const { data: lugar, error } = await db().from('lugares').select('*, provincias(*)').eq('slug', slug).single();
  if (error || !lugar || !lugar.aprobado) return null;

  const { data: pivots } = await db()
    .from('plato_lugar')
    .select('*, platos(*)')
    .eq('lugar_id', lugar.id);

  const platos = (pivots || []).map((pv: any) => ({
    ...mapPlato(pv.platos),
    pivot: {
      precio_aproximado: pv.precio_aproximado ? Number(pv.precio_aproximado) : null,
      especialidad: pv.especialidad,
      imagen_url: pv.imagen_url || null,
    },
  }));

  const { data: resenas } = await db()
    .from('resenas')
    .select('*, users(id, name)')
    .eq('lugar_id', lugar.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  return { lugar: mapLugar(lugar), platos, resenas: (resenas || []).map(mapResena) };
});

export async function getAllSlugsForSitemap(): Promise<{
  provincias: string[];
  platos: string[];
  lugares: string[];
}> {
  try {
    const [{ data: provs }, { data: plats }, { data: lugs }] = await Promise.all([
      db().from('provincias').select('slug'),
      db().from('platos').select('slug').eq('activo', true),
      db().from('lugares').select('slug').eq('aprobado', true).eq('activo', true),
    ]);
    return {
      provincias: (provs || []).map((r: { slug: string }) => r.slug),
      platos: (plats || []).map((r: { slug: string }) => r.slug),
      lugares: (lugs || []).map((r: { slug: string }) => r.slug),
    };
  } catch {
    return { provincias: [], platos: [], lugares: [] };
  }
}

export async function getRankingGlobal(): Promise<any[]> {
  const { data: platos } = await db().from('platos').select('*, provincias(*)').eq('activo', true);
  if (!platos) return [];

  const { data: allResenas } = await db().from('resenas').select('*').eq('is_approved', true);

  const typicalRankings = platos.map((p: any) => {
    const reviews = (allResenas || []).filter((r: any) => r.plato_id === p.id);
    const count = reviews.length;
    const avg = count > 0 ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / count : (p.promedio_rating ? Number(p.promedio_rating) : 4.0);
    return {
      id: p.id, nombre: p.nombre, slug: p.slug, descripcion: p.descripcion,
      precio_referencial: p.precio_referencial ? Number(p.precio_referencial) : null,
      destacado: !!p.destacado,
      provincia: p.provincias ? mapProvincia(p.provincias) : undefined,
      promedio_rating: avg, total_resenas: count, imagen_url: p.imagen_url, es_especialidad: false,
    };
  });

  const specialtiesMap = new Map<string, { nombre: string; reviews: any[]; lugaresIds: number[] }>();
  (allResenas || []).filter((r: any) => r.especialidad_nombre).forEach((r: any) => {
    const name = r.especialidad_nombre!.trim();
    const key = name.toLowerCase();
    if (!specialtiesMap.has(key)) specialtiesMap.set(key, { nombre: name, reviews: [], lugaresIds: [] });
    const item = specialtiesMap.get(key)!;
    item.reviews.push(r);
    if (r.lugar_id && !item.lugaresIds.includes(r.lugar_id)) item.lugaresIds.push(r.lugar_id);
  });

  const { data: lugares } = await db().from('lugares').select('*, provincias(*)');
  (lugares || []).forEach((l: any) => {
    const espList: Especialidad[] = l.especialidades || [];
    espList.forEach((esp: Especialidad) => {
      const key = esp.nombre.toLowerCase();
      if (!specialtiesMap.has(key)) specialtiesMap.set(key, { nombre: esp.nombre, reviews: [], lugaresIds: [] });
      const item = specialtiesMap.get(key)!;
      if (!item.lugaresIds.includes(l.id)) item.lugaresIds.push(l.id);
    });
  });

  const specialtyRankings = Array.from(specialtiesMap.values()).map((sp, idx) => {
    const count = sp.reviews.length;
    const avg = count > 0 ? sp.reviews.reduce((sum, r) => sum + r.rating, 0) / count : 4.0;
    let bestLugar: any = null;
    let maxRating = -1;
    let customImage: string | null = null;
    let bestPrecio: number | null = null;
    sp.lugaresIds.forEach((lId: number) => {
      const lugar = (lugares || []).find((l: any) => l.id === lId);
      if (lugar) {
        const lReviews = (allResenas || []).filter((r: any) => r.lugar_id === lugar.id);
        const lAvg = lReviews.length > 0 ? lReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / lReviews.length : 4.0;
        const espObj = (lugar.especialidades || []).find((e: Especialidad) => e.nombre.toLowerCase() === sp.nombre.toLowerCase());
        if (lAvg > maxRating) {
          maxRating = lAvg;
          bestLugar = lugar;
          customImage = espObj?.imagen_url || lugar.imagen_url;
          bestPrecio = espObj?.precio ? Number(espObj.precio) : null;
        }
      }
    });
    return {
      id: 10000 + idx, nombre: sp.nombre,
      slug: sp.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      descripcion: `Especialidad de la casa, destacada en: ${bestLugar ? bestLugar.nombre : "Varios locales"}.`,
      precio_referencial: bestPrecio,
      provincia: bestLugar?.provincias ? mapProvincia(bestLugar.provincias) : undefined,
      promedio_rating: avg, total_resenas: count, imagen_url: customImage || "/images/placeholder-plate.svg",
      es_especialidad: true, lugar_slug: bestLugar ? bestLugar.slug : null,
    };
  });

  return [...typicalRankings, ...specialtyRankings].sort((a: any, b: any) => {
    const rA = a.promedio_rating ?? 0;
    const rB = b.promedio_rating ?? 0;
    if (rB !== rA) return rB - rA;
    return b.total_resenas - a.total_resenas;
  });
}

export async function getChatbotContext(lat?: number, lng?: number, budget?: number): Promise<string> {
  let query = db()
    .from('plato_lugar')
    .select('*, platos(*), lugares(*)');

  const { data: pivots } = await query;

  let results = (pivots || [])
    .filter((pv: any) => pv.lugares?.aprobado && pv.lugares?.activo)
    .map((pv: any) => {
      const plato = pv.platos;
      const lugar = pv.lugares;
      return {
        plato: plato?.nombre, lugar: lugar?.nombre, direccion: lugar?.direccion,
        precio: pv.precio_aproximado ? Number(pv.precio_aproximado) : null,
        rating: plato?.promedio_rating ? Number(plato.promedio_rating) : null,
        lat: lugar?.lat ? Number(lugar.lat) : 0,
        lng: lugar?.lng ? Number(lugar.lng) : 0,
      };
    }).filter(Boolean);

  if (budget) results = results.filter(r => r.precio !== null && r.precio! <= budget);

  if (lat && lng) {
    const { haversine } = await import('./utils');
    results = results.map(r => ({ ...r, distancia_km: haversine(lat, lng, r.lat, r.lng) }))
      .sort((a: any, b: any) => (a.distancia_km ?? 999) - (b.distancia_km ?? 999));
  }

  return results.slice(0, 15).map((r: any) => {
    let line = `- ${r.plato} en "${r.lugar}"`;
    if (r.precio) line += ` | ${r.precio} Bs`;
    if (r.rating) line += ` | ★${r.rating.toFixed(1)}`;
    if (r.distancia_km) line += ` | ${r.distancia_km.toFixed(1)} km`;
    if (r.direccion) line += ` | ${r.direccion}`;
    return line;
  }).join('\n');
}

export async function getStaticGastroDatabase(): Promise<string> {
  const { data: provincias } = await db().from('provincias').select('*');
  if (!provincias) return '';
  const result: string[] = [];
  for (const prov of provincias) {
    const { data: platosData } = await db().from('platos').select('nombre').eq('provincia_id', prov.id);
    if (platosData && platosData.length > 0) {
      result.push(`- Provincia ${prov.nombre}: ${platosData.map(p => p.nombre).join(', ')}`);
    }
  }
  return result.join('\n');
}

export interface Solicitud {
  id: number; nombre: string; direccion: string; telefono: string;
  nombre_propietario: string; email_propietario: string | null;
  provincia: string; lat: number; lng: number;
  platos_que_sirve: string; especialidades: string | null;
  fecha: string; status: "pendiente" | "aprobado" | "rechazado";
}

export async function getSolicitudes(): Promise<Solicitud[]> {
  const { data, error } = await db().from('solicitudes').select('*').order('fecha', { ascending: false });
  if (error) throw error;
  return (data || []).map((r: any) => ({
    ...r, lat: Number(r.lat), lng: Number(r.lng),
  }));
}

export async function createSolicitud(data: Omit<Solicitud, "id" | "fecha" | "status">): Promise<Solicitud> {
  const { data: newSol, error } = await db().from('solicitudes').insert({
    ...data, status: 'pendiente', fecha: new Date().toISOString().split('T')[0],
  }).select().single();
  if (error) throw error;
  return { ...newSol, lat: Number(newSol.lat), lng: Number(newSol.lng) };
}

export async function updateSolicitudStatus(id: number, status: "aprobado" | "rechazado"): Promise<boolean> {
  const { error } = await db().from('solicitudes').update({ status }).eq('id', id);
  if (error) throw error;

  if (status === "aprobado") {
    const { data: sol } = await db().from('solicitudes').select('*').eq('id', id).single();
    if (sol) {
      const slug = sol.nombre.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const { data: provincias } = await db().from('provincias').select('*');
      const prov = provincias?.find((p: any) => p.nombre.toLowerCase() === sol.provincia.toLowerCase()) || provincias?.[0];

      const especialidadesList = sol.especialidades
        ? sol.especialidades.split(",").map((esp: string, i: number) => ({
            id: 50000 + i + Math.floor(Math.random() * 1000),
            nombre: esp.trim(), precio: 25.0, imagen_url: null, total_resenas: 0, promedio_rating: null,
          }))
        : [];

      const { data: newLugar } = await db().from('lugares').insert({
        provincia_id: prov?.id || 1, nombre: sol.nombre, slug, direccion: sol.direccion,
        telefono: sol.telefono, lat: Number(sol.lat), lng: Number(sol.lng),
        activo: true, aprobado: true, contacto_propietario: sol.nombre_propietario,
        nombre_propietario: sol.nombre_propietario, email_propietario: sol.email_propietario,
        especialidades: especialidadesList,
      }).select().single();
      if (!newLugar) return true;

      const { data: platos } = await db().from('platos').select('*');
      const platosList = sol.platos_que_sirve?.split(",").map((p: string) => p.trim().toLowerCase()) || [];
      for (const platoName of platosList) {
        const plato = platos?.find((p: any) =>
          p.nombre.toLowerCase().includes(platoName) || platoName.includes(p.nombre.toLowerCase())
        );
        if (plato) {
          await db().from('plato_lugar').insert({
            plato_id: plato.id, lugar_id: newLugar.id,
            precio_aproximado: plato.precio_referencial, especialidad: false,
          });
        }
      }
    }
  }
  return true;
}

export async function getReviewsAdmin(): Promise<Resena[]> {
  const { data, error } = await db()
    .from('resenas')
    .select('*, users(id, name), platos(*), lugares(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapResena);
}

export async function updateReviewStatus(id: number, approve: boolean): Promise<boolean> {
  const { error } = await db().from('resenas').update({ is_approved: approve, reviewed: true }).eq('id', id);
  if (error) throw error;
  return true;
}

async function recalculatePlatoRating(platoId: number): Promise<void> {
  const { data: rows } = await db()
    .from('resenas')
    .select('rating')
    .eq('plato_id', platoId)
    .eq('is_approved', true);
  const count = (rows || []).length;
  const avg = count > 0
    ? Number(((rows || []).reduce((sum: number, r: any) => sum + Number(r.rating), 0) / count).toFixed(2))
    : null;
  await db().from('platos').update({ promedio_rating: avg, total_resenas: count }).eq('id', platoId);
}

export async function deleteReviewAdmin(id: number): Promise<boolean> {
  const { data: existing } = await db().from('resenas').select('id, plato_id').eq('id', id).single();
  if (!existing) return false;
  const { error } = await db().from('resenas').delete().eq('id', id);
  if (error) throw error;
  if (existing.plato_id) {
    await recalculatePlatoRating(existing.plato_id);
  }
  return true;
}

export async function getAdminStats() {
  const { count: totalPlatos } = await db().from('platos').select('*', { count: 'exact', head: true }).eq('activo', true);
  const { count: totalLugares } = await db().from('lugares').select('*', { count: 'exact', head: true }).eq('aprobado', true);
  const { count: solicitudesPendientes } = await db().from('solicitudes').select('*', { count: 'exact', head: true }).eq('status', 'pendiente');
  const { count: totalResenas } = await db().from('resenas').select('*', { count: 'exact', head: true }).eq('is_approved', true);
  const { count: totalProvincias } = await db().from('provincias').select('*', { count: 'exact', head: true });

  return {
    totalPlatos: totalPlatos || 0, totalLugares: totalLugares || 0,
    solicitudesPendientes: solicitudesPendientes || 0,
    totalResenas: totalResenas || 0, totalProvincias: totalProvincias || 0,
  };
}

export async function getLugaresByProvincia(provinciaSlug?: string): Promise<Lugar[]> {
  let query = db().from('lugares').select('*, provincias(*)').eq('aprobado', true).eq('activo', true);
  if (provinciaSlug) {
    const { data: prov } = await db().from('provincias').select('id').eq('slug', provinciaSlug).single();
    if (prov) query = query.eq('provincia_id', prov.id);
  }
  const { data, error } = await query.order('nombre');
  if (error) throw error;
  return (data || []).map(mapLugar);
}

export async function getAllLugaresAdmin(): Promise<Lugar[]> {
  const { data, error } = await db().from('lugares').select('*, provincias(*)').eq('aprobado', true).order('nombre');
  if (error) throw error;
  return (data || []).map(mapLugar);
}

export async function getProvinciaPorCoordenadas(lat: number, lng: number): Promise<Provincia | null> {
  const { isWithinCochabamba, resolveNearestProvinciaSlug, haversine } = await import("./utils");
  if (!isWithinCochabamba(lat, lng)) return null;

  const { data: provincias } = await db().from('provincias').select('*');
  if (!provincias || provincias.length === 0) return null;

  const anchorSlug = resolveNearestProvinciaSlug(lat, lng);
  if (anchorSlug) {
    const matched = provincias.find((p: any) => p.slug === anchorSlug);
    if (matched) return mapProvincia(matched);
  }

  let nearestProv: any = null;
  let minDist = Infinity;
  provincias.forEach((p: any) => {
    if (p.centro_lat === null || p.centro_lng === null) return;
    const dist = haversine(lat, lng, Number(p.centro_lat), Number(p.centro_lng));
    if (dist < minDist) { minDist = dist; nearestProv = p; }
  });
  return nearestProv ? mapProvincia(nearestProv) : null;
}

export async function getLugarByOwnerEmail(email: string): Promise<Lugar | null> {
  const { data, error } = await db().from('lugares').select('*, provincias(*)')
    .ilike('email_propietario', email).single();
  if (error || !data) return null;
  return mapLugar(data);
}

export async function updateLugarDetails(
  lugarId: number,
  data: { telefono: string; direccion: string; descripcion: string; imagen_url?: string }
): Promise<boolean> {
  const update: any = { telefono: data.telefono, direccion: data.direccion, descripcion: data.descripcion };
  if (data.imagen_url) update.imagen_url = data.imagen_url;
  const { error } = await db().from('lugares').update(update).eq('id', lugarId);
  if (error) throw error;
  return true;
}

export async function updateLugarOwnerEmail(lugarId: number, email: string): Promise<boolean> {
  const { error } = await db().from('lugares').update({ email_propietario: email }).eq('id', lugarId);
  if (error) throw error;
  return true;
}

export async function updatePlatoLugarPivot(
  lugarId: number, platoId: number,
  data: { precio_aproximado: number; imagen_url?: string }
): Promise<boolean> {
  const { data: existing } = await db().from('plato_lugar')
    .select('id').eq('lugar_id', lugarId).eq('plato_id', platoId).single();

  if (existing) {
    const update: any = { precio_aproximado: data.precio_aproximado };
    if (data.imagen_url !== undefined) update.imagen_url = data.imagen_url;
    const { error } = await db().from('plato_lugar').update(update).eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await db().from('plato_lugar').insert({
      lugar_id: lugarId, plato_id: platoId,
      precio_aproximado: data.precio_aproximado, especialidad: false,
      imagen_url: data.imagen_url || null,
    });
    if (error) throw error;
  }
  return true;
}

export async function addSpecialty(
  lugarId: number,
  dataItem: { nombre: string; precio: number; imagen_url?: string }
): Promise<boolean> {
  const { data: lugar } = await db().from('lugares').select('especialidades').eq('id', lugarId).single();
  if (!lugar) return false;

  const espList: Especialidad[] = lugar.especialidades || [];
  const newId = 50000 + espList.length + Math.floor(Math.random() * 1000);
  espList.push({
    id: newId, nombre: dataItem.nombre, precio: dataItem.precio,
    imagen_url: dataItem.imagen_url || null, total_resenas: 0, promedio_rating: null,
  });

  const { error } = await db().from('lugares').update({ especialidades: espList }).eq('id', lugarId);
  if (error) throw error;
  return true;
}

export async function deleteSpecialty(lugarId: number, specialtyId: number): Promise<boolean> {
  const { data: lugar } = await db().from('lugares').select('especialidades').eq('id', lugarId).single();
  if (!lugar) return false;

  const espList: Especialidad[] = (lugar.especialidades || []).filter((e: Especialidad) => e.id !== specialtyId);
  const { error } = await db().from('lugares').update({ especialidades: espList }).eq('id', lugarId);
  if (error) throw error;
  return true;
}

export async function getTrendingGlobal(): Promise<any[]> {
  const { data: platos } = await db().from('platos').select('*, provincias(*)').eq('activo', true);
  if (!platos) return [];

  const { data: allResenas } = await db().from('resenas').select('*').eq('is_approved', true);
  const referenceDate = new Date("2026-06-24T12:00:00Z");

  const calculateHotScore = (reviews: any[]) => {
    let score = 0;
    reviews.forEach((r: any) => {
      if (!r.fecha_visita) return;
      const diffMs = referenceDate.getTime() - new Date(r.fecha_visita).getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays < 0 || diffDays > 45) return;
      const weight = diffDays <= 15 ? 1.0 : 0.3;
      score += r.rating * weight;
    });
    return score;
  };

  const typicalRankings = platos.map((p: any) => {
    const reviews = (allResenas || []).filter((r: any) => r.plato_id === p.id);
    const count = reviews.length;
    const avg = count > 0 ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / count : (p.promedio_rating ? Number(p.promedio_rating) : 4.0);
    const hotScore = calculateHotScore(reviews);
    return {
      id: p.id, nombre: p.nombre, slug: p.slug, descripcion: p.descripcion,
      precio_referencial: p.precio_referencial ? Number(p.precio_referencial) : null,
      destacado: !!p.destacado,
      provincia: p.provincias ? mapProvincia(p.provincias) : undefined,
      promedio_rating: avg, total_resenas: count, imagen_url: p.imagen_url,
      es_especialidad: false, hot_score: hotScore,
    };
  });

  const specialtiesMap = new Map<string, { nombre: string; reviews: any[]; lugaresIds: number[] }>();
  (allResenas || []).filter((r: any) => r.especialidad_nombre).forEach((r: any) => {
    const name = r.especialidad_nombre!.trim();
    const key = name.toLowerCase();
    if (!specialtiesMap.has(key)) specialtiesMap.set(key, { nombre: name, reviews: [], lugaresIds: [] });
    const item = specialtiesMap.get(key)!;
    item.reviews.push(r);
    if (r.lugar_id && !item.lugaresIds.includes(r.lugar_id)) item.lugaresIds.push(r.lugar_id);
  });

  const { data: lugares } = await db().from('lugares').select('*, provincias(*)');
  (lugares || []).forEach((l: any) => {
    (l.especialidades || []).forEach((esp: Especialidad) => {
      const key = esp.nombre.toLowerCase();
      if (!specialtiesMap.has(key)) specialtiesMap.set(key, { nombre: esp.nombre, reviews: [], lugaresIds: [] });
      const item = specialtiesMap.get(key)!;
      if (!item.lugaresIds.includes(l.id)) item.lugaresIds.push(l.id);
    });
  });

  const specialtyRankings = Array.from(specialtiesMap.values()).map((sp, idx) => {
    const count = sp.reviews.length;
    const avg = count > 0 ? sp.reviews.reduce((sum, r) => sum + r.rating, 0) / count : 4.0;
    const hotScore = calculateHotScore(sp.reviews);
    let bestLugar: any = null;
    let maxRating = -1;
    let customImage: string | null = null;
    let bestPrecio: number | null = null;
    sp.lugaresIds.forEach((lId: number) => {
      const lugar = (lugares || []).find((l: any) => l.id === lId);
      if (lugar) {
        const lReviews = (allResenas || []).filter((r: any) => r.lugar_id === lugar.id);
        const lAvg = lReviews.length > 0 ? lReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / lReviews.length : 4.0;
        const espObj = (lugar.especialidades || []).find((e: Especialidad) => e.nombre.toLowerCase() === sp.nombre.toLowerCase());
        if (lAvg > maxRating) {
          maxRating = lAvg;
          bestLugar = lugar;
          customImage = espObj?.imagen_url || lugar.imagen_url;
          bestPrecio = espObj?.precio ? Number(espObj.precio) : null;
        }
      }
    });
    return {
      id: 10000 + idx, nombre: sp.nombre,
      slug: sp.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      descripcion: `Especialidad de la casa, destacada en: ${bestLugar ? bestLugar.nombre : "Varios locales"}.`,
      precio_referencial: bestPrecio,
      provincia: bestLugar?.provincias ? mapProvincia(bestLugar.provincias) : undefined,
      promedio_rating: avg, total_resenas: count,
      imagen_url: customImage || "/images/placeholder-plate.svg",
      es_especialidad: true, lugar_slug: bestLugar ? bestLugar.slug : null,
      hot_score: hotScore,
    };
  });

  return [...typicalRankings, ...specialtyRankings].sort((a: any, b: any) => b.hot_score - a.hot_score);
}

// =============================================
// CRUD para el panel de administración
// =============================================

export interface AdminPlatoRow {
  id: number;
  nombre: string;
  slug: string;
  provincia_slug: string;
  precio_referencial: number | null;
  destacado: boolean;
  activo: boolean;
  imagen_url: string | null;
}

export interface AdminLugarRow {
  id: number;
  nombre: string;
  slug: string;
  provincia_slug: string;
  direccion: string | null;
  telefono: string | null;
  lat: number;
  lng: number;
  activo: boolean;
  aprobado: boolean;
  imagen_url: string | null;
}

async function uniqueSlug(table: "platos" | "lugares", base: string, excludeId?: number): Promise<string> {
  const root = base || "nuevo";
  let candidate = root;
  let i = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let q = db().from(table).select("id").eq("slug", candidate);
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q.limit(1);
    if (!data || data.length === 0) return candidate;
    candidate = `${root}-${i++}`;
  }
}

async function provinciaIdBySlug(slug: string): Promise<number | null> {
  const { data } = await db().from("provincias").select("id").eq("slug", slug).single();
  return data?.id ?? null;
}

export async function getPlatosAdmin(): Promise<AdminPlatoRow[]> {
  const { data, error } = await db()
    .from("platos")
    .select("*, provincias(slug)")
    .order("nombre");
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    nombre: r.nombre,
    slug: r.slug,
    provincia_slug: r.provincias?.slug ?? "",
    precio_referencial: r.precio_referencial != null ? Number(r.precio_referencial) : null,
    destacado: !!r.destacado,
    activo: r.activo !== false,
    imagen_url: r.imagen_url ?? null,
  }));
}

export async function createPlatoAdmin(input: {
  nombre: string;
  provincia_slug: string;
  precio_referencial?: number | null;
  destacado?: boolean;
  activo?: boolean;
  imagen_url?: string | null;
  descripcion?: string;
}): Promise<AdminPlatoRow> {
  const provinciaId = await provinciaIdBySlug(input.provincia_slug);
  if (!provinciaId) throw new Error("Provincia no encontrada");

  const baseSlug = input.nombre
    .toLowerCase()
    .replace(/[ñÑ]/g, "n")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const slug = await uniqueSlug("platos", baseSlug);

  const { data, error } = await db()
    .from("platos")
    .insert({
      provincia_id: provinciaId,
      nombre: input.nombre,
      slug,
      descripcion: input.descripcion ?? "",
      precio_referencial: input.precio_referencial ?? null,
      destacado: input.destacado ?? false,
      activo: input.activo ?? true,
      imagen_url: input.imagen_url ?? null,
    })
    .select("*, provincias(slug)")
    .single();
  if (error) throw error;

  return {
    id: data.id,
    nombre: data.nombre,
    slug: data.slug,
    provincia_slug: data.provincias?.slug ?? "",
    precio_referencial: data.precio_referencial != null ? Number(data.precio_referencial) : null,
    destacado: !!data.destacado,
    activo: data.activo !== false,
    imagen_url: data.imagen_url ?? null,
  };
}

export async function updatePlatoAdmin(
  id: number,
  patch: {
    nombre?: string;
    provincia_slug?: string;
    precio_referencial?: number | null;
    destacado?: boolean;
    activo?: boolean;
    imagen_url?: string | null;
  }
): Promise<boolean> {
  const update: Record<string, unknown> = {};
  if (patch.nombre !== undefined) update.nombre = patch.nombre;
  if (patch.precio_referencial !== undefined) update.precio_referencial = patch.precio_referencial;
  if (patch.destacado !== undefined) update.destacado = patch.destacado;
  if (patch.activo !== undefined) update.activo = patch.activo;
  if (patch.imagen_url !== undefined) update.imagen_url = patch.imagen_url;
  if (patch.provincia_slug !== undefined) {
    const provinciaId = await provinciaIdBySlug(patch.provincia_slug);
    if (!provinciaId) throw new Error("Provincia no encontrada");
    update.provincia_id = provinciaId;
  }
  if (Object.keys(update).length === 0) return true;

  const { error } = await db().from("platos").update(update).eq("id", id);
  if (error) throw error;
  return true;
}

export async function deletePlatoAdmin(id: number): Promise<boolean> {
  const { error } = await db().from("platos").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function getLugaresAdminList(): Promise<AdminLugarRow[]> {
  const { data, error } = await db()
    .from("lugares")
    .select("*, provincias(slug)")
    .order("nombre");
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    nombre: r.nombre,
    slug: r.slug,
    provincia_slug: r.provincias?.slug ?? "",
    direccion: r.direccion,
    telefono: r.telefono,
    lat: Number(r.lat),
    lng: Number(r.lng),
    activo: r.activo !== false,
    aprobado: !!r.aprobado,
    imagen_url: r.imagen_url ?? null,
  }));
}

export async function createLugarAdmin(input: {
  nombre: string;
  provincia_slug: string;
  direccion?: string | null;
  telefono?: string | null;
  lat: number;
  lng: number;
  activo?: boolean;
  aprobado?: boolean;
  imagen_url?: string | null;
}): Promise<AdminLugarRow> {
  const provinciaId = await provinciaIdBySlug(input.provincia_slug);
  if (!provinciaId) throw new Error("Provincia no encontrada");

  const baseSlug = input.nombre
    .toLowerCase()
    .replace(/[ñÑ]/g, "n")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const slug = await uniqueSlug("lugares", baseSlug);

  const { data, error } = await db()
    .from("lugares")
    .insert({
      provincia_id: provinciaId,
      nombre: input.nombre,
      slug,
      direccion: input.direccion ?? null,
      telefono: input.telefono ?? null,
      lat: input.lat,
      lng: input.lng,
      activo: input.activo ?? true,
      aprobado: input.aprobado ?? true,
      imagen_url: input.imagen_url ?? null,
    })
    .select("*, provincias(slug)")
    .single();
  if (error) throw error;

  return {
    id: data.id,
    nombre: data.nombre,
    slug: data.slug,
    provincia_slug: data.provincias?.slug ?? "",
    direccion: data.direccion,
    telefono: data.telefono,
    lat: Number(data.lat),
    lng: Number(data.lng),
    activo: data.activo !== false,
    aprobado: !!data.aprobado,
    imagen_url: data.imagen_url ?? null,
  };
}

export async function updateLugarAdmin(
  id: number,
  patch: {
    nombre?: string;
    provincia_slug?: string;
    direccion?: string | null;
    telefono?: string | null;
    lat?: number;
    lng?: number;
    activo?: boolean;
    aprobado?: boolean;
    imagen_url?: string | null;
  }
): Promise<boolean> {
  const update: Record<string, unknown> = {};
  if (patch.nombre !== undefined) update.nombre = patch.nombre;
  if (patch.direccion !== undefined) update.direccion = patch.direccion;
  if (patch.telefono !== undefined) update.telefono = patch.telefono;
  if (patch.lat !== undefined) update.lat = patch.lat;
  if (patch.lng !== undefined) update.lng = patch.lng;
  if (patch.activo !== undefined) update.activo = patch.activo;
  if (patch.aprobado !== undefined) update.aprobado = patch.aprobado;
  if (patch.imagen_url !== undefined) update.imagen_url = patch.imagen_url;
  if (patch.provincia_slug !== undefined) {
    const provinciaId = await provinciaIdBySlug(patch.provincia_slug);
    if (!provinciaId) throw new Error("Provincia no encontrada");
    update.provincia_id = provinciaId;
  }
  if (Object.keys(update).length === 0) return true;

  const { error } = await db().from("lugares").update(update).eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteLugarAdmin(id: number): Promise<boolean> {
  const { error } = await db().from("lugares").delete().eq("id", id);
  if (error) throw error;
  return true;
}

async function getOrCreateGuestUserId(): Promise<number> {
  const guestEmail = "visitante@gastrococha.local";
  const { data: existing } = await db().from("users").select("id").eq("email", guestEmail).single();
  if (existing?.id) return existing.id;

  const { data: created, error } = await db()
    .from("users")
    .insert({
      name: "Visitante",
      email: guestEmail,
      password_hash: "guest-no-login",
      role: "user",
    })
    .select("id")
    .single();
  if (error || !created) throw error || new Error("No se pudo crear usuario visitante");
  return created.id;
}

export async function createResenaBySlug(input: {
  userId?: number | null;
  guestName?: string | null;
  platoSlug?: string;
  lugarSlug?: string;
  rating: number;
  titulo: string | null;
  comentario: string;
}): Promise<{ id: number; authorName: string } | null> {
  let platoId: number | null = null;
  let lugarId: number | null = null;

  if (input.platoSlug) {
    const { data: plato } = await db()
      .from("platos")
      .select("id")
      .eq("slug", input.platoSlug)
      .eq("activo", true)
      .single();
    if (plato) platoId = plato.id;
  }

  if (input.lugarSlug) {
    const { data: lugar } = await db()
      .from("lugares")
      .select("id")
      .eq("slug", input.lugarSlug)
      .eq("aprobado", true)
      .eq("activo", true)
      .single();
    if (lugar) lugarId = lugar.id;
  }

  if (!platoId && !lugarId) return null;

  const resolvedUserId = input.userId ?? (await getOrCreateGuestUserId());
  const cleanGuest = input.guestName?.trim();
  const effectiveTitle = !input.userId && cleanGuest
    ? (input.titulo ? `${cleanGuest} — ${input.titulo}` : cleanGuest)
    : input.titulo;

  const { data, error } = await db()
    .from("resenas")
    .insert({
      user_id: resolvedUserId,
      plato_id: platoId,
      lugar_id: lugarId,
      rating: input.rating,
      titulo: effectiveTitle,
      comentario: input.comentario,
      fecha_visita: new Date().toISOString().split("T")[0],
      is_approved: true,
      reviewed: true,
    })
    .select("id")
    .single();

  if (error || !data) throw error || new Error("No se pudo guardar la reseña");

  if (platoId) {
    await recalculatePlatoRating(platoId);
  }

  return { id: data.id, authorName: cleanGuest || "Visitante" };
}

export interface FullChatbotContextResult {
  contextText: string;
  topDish: { nombre: string; slug: string; rating: number; total_resenas: number; es_especialidad: boolean; lugar_slug?: string | null } | null;
  nearestPlace: { nombre: string; slug: string; direccion: string | null; lat: number; lng: number; km: number } | null;
  currentPageInfo: { type: "plato" | "negocio" | "provincia" | "other"; slug?: string; nombre?: string } | null;
}

export async function getFullChatbotContext(options: {
  lat?: number;
  lng?: number;
  budget?: number;
  role: "guest" | "user" | "owner" | "admin";
  userEmail?: string;
  pathname?: string;
}): Promise<FullChatbotContextResult> {
  const [{ data: provincias }, { data: platos }, { data: lugares }, { data: pivots }, ranking] =
    await Promise.all([
      db().from("provincias").select("id, nombre, slug").order("nombre"),
      db().from("platos").select("id, nombre, slug, precio_referencial, promedio_rating, total_resenas, provincias(nombre, slug)").eq("activo", true).order("nombre"),
      db().from("lugares").select("id, nombre, slug, direccion, telefono, lat, lng, especialidades, provincias(nombre, slug)").eq("aprobado", true).eq("activo", true).order("nombre"),
      db().from("plato_lugar").select("plato_id, lugar_id, precio_aproximado, especialidad"),
      getRankingGlobal(),
    ]);

  const hasCoords = typeof options.lat === "number" && typeof options.lng === "number" && !Number.isNaN(options.lat) && !Number.isNaN(options.lng);
  const { haversine } = hasCoords ? await import("./utils") : { haversine: null as any };

  const lugaresEnriched = (lugares || []).map((l: any) => {
    const lat = Number(l.lat);
    const lng = Number(l.lng);
    const km = hasCoords ? haversine(options.lat!, options.lng!, lat, lng) : null;
    const myPivots = (pivots || []).filter((pv: any) => pv.lugar_id === l.id);
    const dishEntries = myPivots
      .map((pv: any) => {
        const pl = (platos || []).find((p: any) => p.id === pv.plato_id);
        if (!pl) return null;
        const price = pv.precio_aproximado ? Number(pv.precio_aproximado) : pl.precio_referencial ? Number(pl.precio_referencial) : null;
        return `${pl.nombre}${price ? ` (${price} Bs)` : ""}`;
      })
      .filter(Boolean);
    const specs = (l.especialidades || []).map((e: any) => `${e.nombre}${e.precio ? ` (${e.precio} Bs)` : ""}`);
    return {
      id: l.id,
      nombre: l.nombre,
      slug: l.slug,
      provincia: l.provincias?.nombre || "",
      provinciaSlug: l.provincias?.slug || "",
      direccion: l.direccion,
      lat,
      lng,
      km,
      menu: [...dishEntries, ...specs],
    };
  });

  if (hasCoords) {
    lugaresEnriched.sort((a: any, b: any) => (a.km ?? 9999) - (b.km ?? 9999));
  }

  const sections: string[] = [];

  // 1. Current page context
  let currentPageInfo: FullChatbotContextResult["currentPageInfo"] = { type: "other" };
  const path = (options.pathname || "/").split("?")[0];
  if (path.startsWith("/plato/")) {
    const slug = path.replace("/plato/", "").split("/")[0];
    const match = (platos || []).find((p: any) => p.slug === slug);
    if (match) {
      currentPageInfo = { type: "plato", slug: match.slug, nombre: match.nombre };
      const servingPlaces = (pivots || [])
        .filter((pv: any) => pv.plato_id === match.id)
        .map((pv: any) => lugaresEnriched.find((l: any) => l.id === pv.lugar_id))
        .filter(Boolean)
        .map((l: any) => `${l.nombre} (slug: ${l.slug})`);
      sections.push(
        `[PÁGINA ACTUAL DEL USUARIO]\nEstá viendo la ficha del plato: "${match.nombre}" (slug: ${match.slug}, ruta: /plato/${match.slug}). Locales donde se sirve: ${servingPlaces.join(", ") || "Consultar locales"}.`
      );
    }
  } else if (path.startsWith("/negocio/")) {
    const slug = path.replace("/negocio/", "").split("/")[0];
    const match = lugaresEnriched.find((l: any) => l.slug === slug);
    if (match) {
      currentPageInfo = { type: "negocio", slug: match.slug, nombre: match.nombre };
      sections.push(
        `[PÁGINA ACTUAL DEL USUARIO]\nEstá viendo la ficha del negocio: "${match.nombre}" (slug: ${match.slug}, ruta: /negocio/${match.slug}, provincia: ${match.provincia}). Menú: ${match.menu.join(", ") || "sin platos cargados"}.`
      );
    }
  } else if (path.startsWith("/provincia/")) {
    const slug = path.replace("/provincia/", "").split("/")[0];
    const match = (provincias || []).find((p: any) => p.slug === slug);
    if (match) {
      currentPageInfo = { type: "provincia", slug: match.slug, nombre: match.nombre };
      sections.push(
        `[PÁGINA ACTUAL DEL USUARIO]\nEstá viendo la provincia: "${match.nombre}" (slug: ${match.slug}, ruta: /provincia/${match.slug}).`
      );
    }
  } else {
    sections.push(`[PÁGINA ACTUAL DEL USUARIO]\nRuta actual: ${path}`);
  }

  // 2. GPS Coordinates
  if (hasCoords) {
    sections.push(
      `[UBICACIÓN GPS DEL USUARIO ACTIVA]\nLatitud: ${options.lat!.toFixed(5)}, Longitud: ${options.lng!.toFixed(5)}. Los locales abajo ya están ordenados del más cercano al más lejano.`
    );
  }

  // 3. Top Ranking
  const topRankingLines = (ranking || []).slice(0, 8).map((r: any, idx: number) => {
    const url = r.es_especialidad && r.lugar_slug ? `/negocio/${r.lugar_slug}` : `/plato/${r.slug}`;
    return `${idx + 1}. ${r.nombre} | ★${Number(r.promedio_rating || 0).toFixed(1)} (${r.total_resenas} reseñas) | ${r.precio_referencial ? `${r.precio_referencial} Bs` : "Consultar"} | ruta: ${url}`;
  });
  if (topRankingLines.length > 0) {
    sections.push(`[RANKING REAL DE PLATOS (ORDENADO DE MEJOR A MENOR)]\n${topRankingLines.join("\n")}`);
  }

  // 4. All active dishes
  const filteredPlatos = options.budget
    ? (platos || []).filter((p: any) => p.precio_referencial != null && Number(p.precio_referencial) <= options.budget!)
    : (platos || []);
  const platosLines = filteredPlatos.map((p: any) => {
    const precio = p.precio_referencial ? `${Number(p.precio_referencial)} Bs` : "Consultar";
    return `- ${p.nombre} | slug: ${p.slug} | ruta: /plato/${p.slug} | provincia: ${p.provincias?.nombre || "—"} | ${precio}`;
  });
  sections.push(`[TODOS LOS PLATOS TÍPICOS ACTIVOS (${platosLines.length})]\n${platosLines.join("\n")}`);

  // 5. All approved places
  const lugaresLines = lugaresEnriched.map((l: any) => {
    const dist = l.km !== null ? ` | a ${l.km.toFixed(1)} km` : "";
    const menuStr = l.menu.length > 0 ? ` | platos: ${l.menu.join(", ")}` : "";
    return `- ${l.nombre} | slug: ${l.slug} | ruta: /negocio/${l.slug} | provincia: ${l.provincia} | dir: ${l.direccion || "—"} | coords: (${l.lat}, ${l.lng})${dist}${menuStr}`;
  });
  sections.push(`[TODOS LOS LOCALES ACTIVOS Y APROBADOS (${lugaresLines.length})]\n${lugaresLines.join("\n")}`);

  // 6. Provinces
  const provLines = (provincias || []).map((p: any) => `${p.nombre} (/provincia/${p.slug})`);
  sections.push(`[PROVINCIAS (16)]\n${provLines.join(", ")}`);

  // 7. Role-specific context (strictly isolated)
  if (options.role === "owner" && options.userEmail) {
    const myLugar = await getLugarByOwnerEmail(options.userEmail);
    if (myLugar) {
      const myMenu = (pivots || [])
        .filter((pv: any) => pv.lugar_id === myLugar.id)
        .map((pv: any) => {
          const pl = (platos || []).find((p: any) => p.id === pv.plato_id);
          return pl ? `${pl.nombre}: ${pv.precio_aproximado ?? pl.precio_referencial ?? "—"} Bs` : null;
        })
        .filter(Boolean);
      const mySpecs = (myLugar.especialidades || []).map((e) => `${e.nombre}: ${e.precio} Bs`);
      sections.push(
        `[TU NEGOCIO COMO PROPIETARIO]\nNombre: ${myLugar.nombre} (ruta: /negocio/${myLugar.slug})\nDirección: ${myLugar.direccion || "—"}\nTeléfono: ${myLugar.telefono || "—"}\nDescripción: ${myLugar.descripcion || "—"}\nMenú típico: ${myMenu.join(", ") || "sin asignar"}\nEspecialidades propias: ${mySpecs.join(", ") || "ninguna"}`
      );
    } else {
      sections.push(`[TU NEGOCIO COMO PROPIETARIO]\nAún no tienes un local vinculado a tu correo (${options.userEmail}).`);
    }
  } else if (options.role === "admin") {
    const [stats, sols, revs] = await Promise.all([
      getAdminStats(),
      getSolicitudes(),
      getReviewsAdmin(),
    ]);
    const pendingSols = sols.filter((s) => s.status === "pendiente").slice(0, 8).map((s) => `#${s.id} "${s.nombre}" (${s.provincia})`);
    const recentRevs = revs.slice(0, 8).map((r) => `#${r.id} "${r.titulo || "Sin título"}" ★${r.rating} (${r.plato?.nombre || r.lugar?.nombre || "General"})`);
    sections.push(
      `[RESUMEN ADMINISTRATIVO ACTUAL]\nPlatos activos: ${stats.totalPlatos} | Lugares aprobados: ${stats.totalLugares} | Solicitudes pendientes: ${stats.solicitudesPendientes} | Reseñas publicadas: ${stats.totalResenas}\nSolicitudes pendientes: ${pendingSols.join("; ") || "ninguna"}\nReseñas recientes: ${recentRevs.join("; ") || "ninguna"}`
    );
  }

  const topDishRow = ranking?.[0];
  const topDish = topDishRow
    ? {
        nombre: topDishRow.nombre,
        slug: topDishRow.slug,
        rating: Number(topDishRow.promedio_rating || 0),
        total_resenas: Number(topDishRow.total_resenas || 0),
        es_especialidad: Boolean(topDishRow.es_especialidad),
        lugar_slug: topDishRow.lugar_slug ?? null,
      }
    : null;

  const nearestRow = hasCoords && lugaresEnriched.length > 0 ? lugaresEnriched[0] : null;
  const nearestPlace = nearestRow
    ? {
        nombre: nearestRow.nombre,
        slug: nearestRow.slug,
        direccion: nearestRow.direccion,
        lat: nearestRow.lat,
        lng: nearestRow.lng,
        km: Number(nearestRow.km || 0),
      }
    : null;

  return {
    contextText: sections.join("\n\n"),
    topDish,
    nearestPlace,
    currentPageInfo,
  };
}
