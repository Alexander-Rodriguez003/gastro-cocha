// =============================================
// Filtro determinista (sin IA) de lenguaje ofensivo para reseñas y chat.
// Permite críticas negativas o constructivas respetuosas,
// bloquea insultos, groserías y ataques dañinos.
// =============================================

const OFFENSIVE_SINGLE_WORDS = [
  "puta",
  "puto",
  "putas",
  "putos",
  "putita",
  "putamadre",
  "mierda",
  "mierdas",
  "mierdero",
  "carajo",
  "carajos",
  "concha",
  "conchetumare",
  "conchatumadre",
  "conchesumadre",
  "ctm",
  "hdp",
  "hijoputa",
  "hijodeputa",
  "hijueputa",
  "malparido",
  "malparida",
  "malnacido",
  "malnacida",
  "huevon",
  "huevona",
  "huevones",
  "webon",
  "weon",
  "weona",
  "boludo",
  "boluda",
  "pelotudo",
  "pelotuda",
  "pendejo",
  "pendeja",
  "pendejos",
  "cabron",
  "cabrona",
  "cabrones",
  "idiota",
  "idiotas",
  "imbecil",
  "imbeciles",
  "estupido",
  "estupida",
  "estupidos",
  "tarado",
  "tarada",
  "retrasado",
  "retrasada",
  "subnormal",
  "mongolico",
  "mongolo",
  "verga",
  "vergas",
  "pene",
  "pito",
  "culo",
  "culos",
  "ojete",
  "zorra",
  "zorras",
  "perra",
  "perras",
  "maricon",
  "maricones",
  "marica",
  "maricas",
  "cojudo",
  "cojuda",
  "cojudos",
  "cojudez",
  "cagada",
  "cagar",
  "cagado",
  "cagaron",
  "joder",
  "jodido",
  "jodida",
  "chingar",
  "chingada",
  "chingado",
  "pinche",
  "culero",
  "culera",
  "mamon",
  "mamona",
  "gonorrea",
  "careverga",
  "caraculo",
  "lameculos",
  "comemierda",
  "desgraciado",
  "desgraciada",
  "miserable",
  "escoria",
  "basura",
  "porqueria",
  "asqueroso",
  "asquerosa",
  "ratas",
  "ladron",
  "ladrones",
  "estafador",
  "estafadores",
  "fuck",
  "fucking",
  "shit",
  "bitch",
  "asshole",
  "bastard",
];

const OFFENSIVE_PHRASES = [
  "hijo de puta",
  "hija de puta",
  "hijos de puta",
  "la concha de tu madre",
  "concha de tu madre",
  "concha tu madre",
  "vete a la mierda",
  "andate a la mierda",
  "váyase a la mierda",
  "vayase a la mierda",
  "valen verga",
  "vale verga",
  "son una mierda",
  "es una mierda",
  "una completa mierda",
  "ojala se mueran",
  "ojala cierren",
  "muerte a",
  "maten a",
  "vayan a cagar",
  "cara de verga",
  "chupa verga",
  "chupapija",
  "me llega al pincho",
];

const LEET_MAP: Record<string, string> = {
  "@": "a",
  "4": "a",
  "3": "e",
  "1": "i",
  "!": "i",
  "0": "o",
  "$": "s",
  "5": "s",
  "7": "t",
};

function normalizeForModeration(input: string): string {
  const noAccents = String(input ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Reemplaza leet-speak básico solo cuando está rodeado de letras
  const deLeeted = noAccents.replace(/([a-z])[@431!0$57]([a-z])|[@431!0$57]([a-z]{2,})|([a-z]{2,})[@431!0$57]/g, (match) =>
    match
      .split("")
      .map((ch) => LEET_MAP[ch] ?? ch)
      .join("")
  );

  // Colapsa repeticiones exageradas de una misma letra (ej. "puuuutaaa" -> "puta", manteniendo "ll"/"rr")
  const collapsed = deLeeted.replace(/([a-z])\1{2,}/g, "$1");

  return collapsed.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export interface ModerationResult {
  isOffensive: boolean;
  matchedTerms: string[];
}

/** Detecta insultos, groserías o expresiones dañinas sin bloquear críticas constructivas. */
export function checkOffensiveContent(...texts: Array<string | null | undefined>): ModerationResult {
  const combined = texts.filter(Boolean).join(" ");
  if (!combined.trim()) {
    return { isOffensive: false, matchedTerms: [] };
  }

  const normalized = normalizeForModeration(combined);
  const words = new Set(normalized.split(" ").filter(Boolean));
  const matched = new Set<string>();

  for (const term of OFFENSIVE_SINGLE_WORDS) {
    if (words.has(term)) {
      matched.add(term);
    }
  }

  for (const phrase of OFFENSIVE_PHRASES) {
    if (normalized.includes(phrase)) {
      matched.add(phrase);
    }
  }

  return {
    isOffensive: matched.size > 0,
    matchedTerms: Array.from(matched),
  };
}

export const OFFENSIVE_REVIEW_WARNING =
  "Tu comentario contiene lenguaje ofensivo o insultos y no se publicará. Aceptamos críticas constructivas o negativas siempre que sean respetuosas.";

export const OFFENSIVE_CHAT_WARNING =
  "Por favor, baja el tono y exprésate con respeto. En GastroCocha no aceptamos insultos ni comentarios ofensivos o dañinos contra personas o locales. Si tuviste una mala experiencia, puedes contarla de forma respetuosa.";
