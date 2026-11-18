export type UserRole = "guest" | "user" | "owner" | "admin";

export type ChatbotAction =
  | { action: "navigate"; url: string }
  | { action: "focus_map"; lat: number; lng: number; label?: string }
  | { action: "filter_list"; max_price: number }
  | { action: "filter_negocios"; query?: string; provincia?: string }
  | { action: "select_map_province"; slug: string }
  | {
      action: "fill_form";
      nombre?: string;
      direccion?: string;
      telefono?: string;
      provincia?: string;
      nombre_propietario?: string;
      email_propietario?: string;
      platos?: string;
    }
  | {
      action: "confirm_review";
      plato_slug?: string;
      plato_nombre?: string;
      lugar_slug?: string;
      lugar_nombre?: string;
      rating: number;
      titulo?: string;
      comentario: string;
    }
  | {
      action: "prefill_owner";
      tab?: "details" | "platos" | "specialties";
      telefono?: string;
      direccion?: string;
      descripcion?: string;
      plato_nombre?: string;
      precio?: number;
      especialidad_nombre?: string;
      especialidad_precio?: number;
    }
  | {
      action: "admin_moderate_solicitud";
      id: number;
      nombre?: string;
      status: "aprobado" | "rechazado";
    }
  | {
      action: "admin_delete_resena";
      id: number;
      titulo?: string;
    };

const PUBLIC_ROUTE_PREFIXES = [
  "/",
  "/provincias",
  "/provincia/",
  "/plato/",
  "/negocios",
  "/negocio/",
  "/ranking",
  "/registrar-negocio",
  "/login",
];

/** Normaliza una calificación a entero en rango 1..5. */
export function normalizeReviewRating(val: unknown): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return 5;
  return Math.min(5, Math.max(1, Math.round(n)));
}

/** Verifica que una ruta interna sea válida y autorizada para el rol actual. */
export function isRouteAllowedForRole(url: string, role: UserRole): boolean {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return false;
  const pathOnly = trimmed.split("?")[0].split("#")[0];

  if (pathOnly.startsWith("/api")) return false;
  if (pathOnly === "/admin" || pathOnly.startsWith("/admin/")) {
    return role === "admin";
  }
  if (pathOnly === "/owner" || pathOnly.startsWith("/owner/")) {
    return role === "owner";
  }

  return PUBLIC_ROUTE_PREFIXES.some((prefix) =>
    prefix === "/"
      ? pathOnly === "/"
      : pathOnly === prefix.replace(/\/$/, "") || pathOnly.startsWith(prefix)
  );
}

/** Valida que una acción emitida por el agente esté autorizada para el rol del usuario. */
export function isActionAllowedForRole(action: ChatbotAction, role: UserRole): boolean {
  switch (action.action) {
    case "navigate":
      return isRouteAllowedForRole(action.url, role);
    case "confirm_review":
      return role !== "guest";
    case "prefill_owner":
      return role === "owner";
    case "admin_moderate_solicitud":
    case "admin_delete_resena":
      return role === "admin";
    case "focus_map":
    case "filter_list":
    case "filter_negocios":
    case "select_map_province":
    case "fill_form":
      return true;
    default:
      return false;
  }
}

const ACTION_BLOCK_REGEX = /\[\[ACTION:\s*(\{[\s\S]*?\})\s*\]\]/g;

/** Extrae el primer bloque [[ACTION: {...}]] válido y limpia todos los marcadores del texto visible. */
export function parseChatbotAction(rawReply: string): {
  cleanReply: string;
  action: ChatbotAction | null;
} {
  const matches = Array.from(rawReply.matchAll(ACTION_BLOCK_REGEX));
  const cleanReply = rawReply.replace(ACTION_BLOCK_REGEX, "").trim();
  if (matches.length === 0) {
    return { cleanReply, action: null };
  }

  try {
    const parsed = JSON.parse(matches[0][1]) as Record<string, unknown>;
    if (!parsed || typeof parsed.action !== "string") {
      return { cleanReply, action: null };
    }
    if (parsed.action === "confirm_review") {
      parsed.rating = normalizeReviewRating(parsed.rating);
    }
    return { cleanReply, action: parsed as unknown as ChatbotAction };
  } catch {
    return { cleanReply, action: null };
  }
}

/** Genera la clave de caché aislada por rol, ruta y estado GPS (null para paneles privados). */
export function buildChatbotCacheKey(
  role: UserRole,
  pathname: string,
  query: string,
  hasCoords: boolean
): string | null {
  if (role === "owner" || role === "admin") return null;
  const normalizedPath = pathname.split("?")[0] || "/";
  return `${role}|${normalizedPath}|${hasCoords ? "gps" : "nogps"}|${query}`;
}
