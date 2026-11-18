/**
 * Calculate distance between two GPS coordinates using the Haversine formula
 * @returns Distance in kilometers
 */
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Format price in Bolivianos
 */
export function formatPrice(price: number | null): string {
  if (price === null) return 'Consultar';
  return `${price.toFixed(0)} Bs`;
}

/**
 * Format distance in a human-readable way
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/**
 * Render star rating as text
 */
export function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

/**
 * Simple hash for passwords (use bcrypt in production with Supabase Auth)
 */
export async function simpleHash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'gastro-cocha-salt');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if coordinates are within Cochabamba department bounds (approx)
 */
export function isWithinCochabamba(lat: number, lng: number): boolean {
  return lat >= -18.5 && lat <= -15.5 && lng >= -67.5 && lng <= -64.5;
}

const PROVINCE_ANCHORS: Array<{ slug: string; lat: number; lng: number }> = [
  { slug: "cercado", lat: -17.3895, lng: -66.1568 },
  { slug: "chapare", lat: -17.4042, lng: -66.0408 }, // Sacaba
  { slug: "chapare", lat: -17.3447, lng: -65.8711 }, // Colomi
  { slug: "chapare", lat: -16.9742, lng: -65.4202 }, // Villa Tunari
  { slug: "quillacollo", lat: -17.394, lng: -66.277 },
  { slug: "quillacollo", lat: -17.338, lng: -66.216 }, // Tiquipaya
  { slug: "quillacollo", lat: -17.392, lng: -66.238 }, // Colcapirhua
  { slug: "quillacollo", lat: -17.396, lng: -66.314 }, // Vinto
  { slug: "quillacollo", lat: -17.454, lng: -66.357 }, // Sipe Sipe
  { slug: "punata", lat: -17.5442, lng: -65.8356 },
  { slug: "punata", lat: -17.526, lng: -65.899 }, // San Benito
  { slug: "german-jordan", lat: -17.5886, lng: -65.9328 }, // Cliza
  { slug: "german-jordan", lat: -17.530, lng: -65.963 }, // Tolata
  { slug: "esteban-arce", lat: -17.6094, lng: -66.0233 }, // Tarata
  { slug: "esteban-arce", lat: -17.562, lng: -66.054 }, // Arbieto
  { slug: "arani", lat: -17.5672, lng: -65.77 },
  { slug: "tiraque", lat: -17.4167, lng: -65.7167 },
  { slug: "carrasco", lat: -17.7833, lng: -65.1667 }, // Totora
  { slug: "carrasco", lat: -16.994, lng: -65.150 }, // Chimoré
  { slug: "mizque", lat: -17.9372, lng: -65.3394 },
  { slug: "capinota", lat: -17.7167, lng: -66.25 },
  { slug: "capinota", lat: -17.554, lng: -66.229 }, // Santiváñez
  { slug: "campero", lat: -18.2028, lng: -65.175 },
  { slug: "ayopaya", lat: -17.0833, lng: -66.8167 },
  { slug: "ayopaya", lat: -17.241, lng: -66.529 }, // Morochata
  { slug: "arque", lat: -17.85, lng: -66.3167 },
  { slug: "tapacari", lat: -17.5167, lng: -66.5667 },
  { slug: "bolivar", lat: -17.9833, lng: -66.0667 },
];

/** Resuelve el slug de provincia más probable por distancia Haversine a cabeceras y municipios. */
export function resolveNearestProvinciaSlug(lat: number, lng: number): string | null {
  if (!isWithinCochabamba(lat, lng)) return null;
  let bestSlug: string | null = null;
  let minKm = Infinity;
  for (const anchor of PROVINCE_ANCHORS) {
    const d = haversine(lat, lng, anchor.lat, anchor.lng);
    if (d < minKm) {
      minKm = d;
      bestSlug = anchor.slug;
    }
  }
  return bestSlug;
}
