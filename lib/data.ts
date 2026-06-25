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

export async function getProvinciaDetail(slug: string): Promise<{ provincia: Provincia; platos: Plato[] } | null> {
  const { data: prov, error } = await db().from('provincias').select('*').eq('slug', slug).single();
  if (error || !prov) return null;
  const { data: platos } = await db().from('platos').select('*').eq('provincia_id', prov.id).eq('activo', true);
  return { provincia: mapProvincia(prov), platos: (platos || []).map(mapPlato) };
}

export async function getPlatosDestacados(): Promise<Plato[]> {
  const { data, error } = await db().from('platos').select('*, provincias(*)').eq('destacado', true).eq('activo', true);
  if (error) throw error;
  return (data || []).map(mapPlato);
}

export async function getPlatoDetail(slug: string): Promise<{ plato: Plato; lugares: LugarConPivot[]; resenas: Resena[] } | null> {
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
}

export async function getLugarDetail(slug: string): Promise<{ lugar: Lugar; platos: any[]; resenas: Resena[] } | null> {
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
}

export async function getRankingGlobal(): Promise<any[]> {
  const { data: platos } = await db().from('platos').select('*').eq('activo', true);
  if (!platos) return [];

  const { data: allResenas } = await db().from('resenas').select('*').eq('is_approved', true);

  const typicalRankings = platos.map((p: any) => {
    const reviews = (allResenas || []).filter((r: any) => r.plato_id === p.id);
    const count = reviews.length;
    const avg = count > 0 ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / count : (p.promedio_rating ? Number(p.promedio_rating) : 4.0);
    return {
      id: p.id, nombre: p.nombre, slug: p.slug, descripcion: p.descripcion,
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

  const { data: lugares } = await db().from('lugares').select('*');
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
    sp.lugaresIds.forEach((lId: number) => {
      const lugar = (lugares || []).find((l: any) => l.id === lId);
      if (lugar) {
        const lReviews = (allResenas || []).filter((r: any) => r.lugar_id === lugar.id);
        const lAvg = lReviews.length > 0 ? lReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / lReviews.length : 4.0;
        const espObj = (lugar.especialidades || []).find((e: Especialidad) => e.nombre.toLowerCase() === sp.nombre.toLowerCase());
        if (lAvg > maxRating) { maxRating = lAvg; bestLugar = lugar; customImage = espObj?.imagen_url || lugar.imagen_url; }
      }
    });
    return {
      id: 10000 + idx, nombre: sp.nombre,
      slug: sp.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      descripcion: `Especialidad de la casa, destacada en: ${bestLugar ? bestLugar.nombre : "Varios locales"}.`,
      promedio_rating: avg, total_resenas: count, imagen_url: customImage || "/images/placeholder-plate.jpg",
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

export async function getAdminStats() {
  const { count: totalPlatos } = await db().from('platos').select('*', { count: 'exact', head: true }).eq('activo', true);
  const { count: totalLugares } = await db().from('lugares').select('*', { count: 'exact', head: true }).eq('aprobado', true);
  const { count: solicitudesPendientes } = await db().from('solicitudes').select('*', { count: 'exact', head: true }).eq('status', 'pendiente');
  const { count: resenasPendientes } = await db().from('resenas').select('*', { count: 'exact', head: true }).eq('is_approved', false).eq('reviewed', false);
  const { count: totalProvincias } = await db().from('provincias').select('*', { count: 'exact', head: true });

  return {
    totalPlatos: totalPlatos || 0, totalLugares: totalLugares || 0,
    solicitudesPendientes: solicitudesPendientes || 0,
    resenasPendientes: resenasPendientes || 0, totalProvincias: totalProvincias || 0,
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
  const { isWithinCochabamba } = await import("./utils");
  if (!isWithinCochabamba(lat, lng)) return null;

  const { data: provincias } = await db().from('provincias').select('*');
  if (!provincias || provincias.length === 0) return null;

  let nearestProv: any = null;
  let minDist = Infinity;
  provincias.forEach((p: any) => {
    if (p.centro_lat === null || p.centro_lng === null) return;
    const dx = lat - Number(p.centro_lat);
    const dy = lng - Number(p.centro_lng);
    const dist = dx * dx + dy * dy;
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
  const { data: platos } = await db().from('platos').select('*').eq('activo', true);
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

  const { data: lugares } = await db().from('lugares').select('*');
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
    sp.lugaresIds.forEach((lId: number) => {
      const lugar = (lugares || []).find((l: any) => l.id === lId);
      if (lugar) {
        const lReviews = (allResenas || []).filter((r: any) => r.lugar_id === lugar.id);
        const lAvg = lReviews.length > 0 ? lReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / lReviews.length : 4.0;
        const espObj = (lugar.especialidades || []).find((e: Especialidad) => e.nombre.toLowerCase() === sp.nombre.toLowerCase());
        if (lAvg > maxRating) { maxRating = lAvg; bestLugar = lugar; customImage = espObj?.imagen_url || lugar.imagen_url; }
      }
    });
    return {
      id: 10000 + idx, nombre: sp.nombre,
      slug: sp.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      descripcion: `Especialidad de la casa, destacada en: ${bestLugar ? bestLugar.nombre : "Varios locales"}.`,
      promedio_rating: avg, total_resenas: count,
      imagen_url: customImage || "/images/placeholder-plate.jpg",
      es_especialidad: true, lugar_slug: bestLugar ? bestLugar.slug : null,
      hot_score: hotScore,
    };
  });

  return [...typicalRankings, ...specialtyRankings].sort((a: any, b: any) => b.hot_score - a.hot_score);
}
