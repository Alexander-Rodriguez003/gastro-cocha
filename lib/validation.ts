// =============================================
// Validación y sanitización de entradas
// - Emails / slugs / teléfonos: ASCII estricto
// - Textos de contenido: conservan tildes y ñ, se eliminan emojis/control
// =============================================

const CONTROL_AND_EMOJI = /[^\p{L}\p{N}\s.,;:!?¿¡'"()\-/#°%&+@_]/gu;

/** Limpia texto de contenido conservando acentos y ñ. */
export function sanitizeText(text: string, maxLength = 200): string {
  return String(text ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(CONTROL_AND_EMOJI, "")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeOptionalText(text: string | null | undefined, maxLength = 200): string | null {
  if (!text) return null;
  const cleaned = sanitizeText(text, maxLength);
  return cleaned || null;
}

/** Email válido: ASCII puro, sin ñ/tildes/emoji. */
export function isValidEmail(email: string): boolean {
  if (!/^[\x00-\x7F]+$/.test(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

const ASCII_MAP: Record<string, string> = {
  "ñ": "n", "Ñ": "N", "ü": "u", "Ü": "U",
};

/** Normaliza un email a ASCII y minúsculas. */
export function sanitizeEmail(email: string): string {
  return String(email ?? "")
    .trim()
    .toLowerCase()
    .replace(/[ñÑüÜ]/g, (c) => ASCII_MAP[c] ?? c)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "");
}

/** Slug ASCII para URLs. */
export function toSlug(text: string, maxLength = 180): string {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[ñÑ]/g, "n")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, maxLength);
}

export function isValidPhone(phone: string): boolean {
  return /^[\d\s+\-()]{7,20}$/.test(phone.trim());
}

export function sanitizePhone(phone: string): string {
  return String(phone ?? "").trim().replace(/[^\d+]/g, "").slice(0, 20);
}

export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Acepta rutas internas (/images/x.png) o URLs http(s). */
export function isValidImageRef(value: string): boolean {
  if (value.startsWith("/")) return true;
  return isValidUrl(value);
}

export function isValidName(name: string): boolean {
  const cleaned = sanitizeName(name);
  return cleaned.length >= 2;
}

/** Nombre visible: letras (con acentos/ñ), números, espacio y . ' - */
export function sanitizeName(name: string, maxLength = 100): string {
  return String(name ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[^\p{L}\p{N}\s.'\-]/gu, "")
    .trim()
    .slice(0, maxLength);
}

export function isValidPassword(password: string): boolean {
  return typeof password === "string" && password.length >= 6;
}

export function sanitizeNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

export function isValidLatitude(val: unknown): boolean {
  const n = sanitizeNumber(val);
  return n !== null && n >= -90 && n <= 90;
}

export function isValidLongitude(val: unknown): boolean {
  const n = sanitizeNumber(val);
  return n !== null && n >= -180 && n <= 180;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
