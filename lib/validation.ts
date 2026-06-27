export function sanitizeText(text: string, maxLength = 200): string {
  return text.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "").slice(0, maxLength);
}

export function sanitizeOptionalText(text: string | null | undefined, maxLength = 200): string | null {
  if (!text) return null;
  const cleaned = sanitizeText(text, maxLength);
  return cleaned || null;
}

export function isValidEmail(email: string): boolean {
  const asciiEmail = email.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x00-\x7F]/g, "");
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(asciiEmail) && /^[\x00-\x7F]+$/.test(email);
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "");
}

export function isValidPhone(phone: string): boolean {
  return /^[\d\s+\-()]{7,20}$/.test(phone.trim());
}

export function sanitizePhone(phone: string): string {
  return phone.trim().replace(/[^\d+]/g, "").slice(0, 20);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidName(name: string): boolean {
  const cleaned = name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return cleaned.length >= 2 && /^[a-zA-Z0-9\s\-'.]+$/.test(cleaned);
}

export function sanitizeName(name: string, maxLength = 100): string {
  return name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9\s\-'.]/g, "").slice(0, maxLength);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function sanitizeNumber(val: any): number | null {
  const n = Number(val);
  return isNaN(n) ? null : n;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
