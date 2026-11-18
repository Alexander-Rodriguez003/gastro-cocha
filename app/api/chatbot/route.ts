import { NextRequest, NextResponse } from "next/server";
import { getFullChatbotContext, type FullChatbotContextResult } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { checkOffensiveContent, OFFENSIVE_CHAT_WARNING } from "@/lib/moderation";
import {
  buildChatbotCacheKey,
  isActionAllowedForRole,
  normalizeReviewRating,
  parseChatbotAction,
  type ChatbotAction,
  type UserRole,
} from "@/lib/chatbot-rules";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

const ROLE_CAPABILITIES: Record<UserRole, string> = {
  guest: `Rol actual: INVITADO (sin sesión).
- Puedes consultar platos, locales, provincias y ranking real.
- Rutas permitidas para navigate: /, /ranking, /negocios, /provincias, /provincia/<slug>, /plato/<slug>, /negocio/<slug>, /registrar-negocio, /login.
- Acciones permitidas: navigate (solo rutas públicas), focus_map, filter_list, filter_negocios, select_map_province, fill_form.
- RESTRICCIÓN: NO puedes publicar reseñas (si pide dejar reseña, dile que inicie sesión y ofrece ir a /login) ni acceder o ejecutar acciones de /owner o /admin.`,

  user: `Rol actual: USUARIO REGISTRADO.
- Puedes hacer todo lo de invitado y además preparar reseñas reales para que el usuario confirme antes de guardarlas.
- Rutas permitidas para navigate: /, /ranking, /negocios, /provincias, /provincia/<slug>, /plato/<slug>, /negocio/<slug>, /registrar-negocio.
- Acciones permitidas: navigate (solo rutas públicas), focus_map, filter_list, filter_negocios, select_map_province, fill_form, confirm_review.
- RESTRICCIÓN: NO tienes acceso ni puedes interactuar con /owner ni /admin.`,

  owner: `Rol actual: PROPIETARIO DE NEGOCIO.
- Tienes acceso a todo lo público y al panel /owner exclusivamente de TU propio negocio (ver sección [TU NEGOCIO COMO PROPIETARIO]).
- Rutas permitidas para navigate: todas las públicas más /owner.
- Acciones permitidas: todas las públicas + confirm_review + prefill_owner.
- Usa prefill_owner para abrir /owner y pre-rellenar cambios sin guardarlos automáticamente:
  [[ACTION: {"action": "prefill_owner", "tab": "details"|"platos"|"specialties", "telefono": "...", "direccion": "...", "descripcion": "...", "plato_nombre": "...", "precio": 30, "especialidad_nombre": "...", "especialidad_precio": 35}]]
- RESTRICCIÓN: NO puedes editar otros locales ni acceder a /admin.`,

  admin: `Rol actual: ADMINISTRADOR.
- Tienes acceso completo a las rutas públicas y a /admin, /admin/platos, /admin/lugares, /admin/solicitudes, /admin/resenas, /admin/propietarios.
- Acciones permitidas: navigate (públicas y /admin/*), focus_map, filter_list, filter_negocios, select_map_province, fill_form, confirm_review, admin_moderate_solicitud, admin_delete_resena.
- Para moderar solicitudes o eliminar reseñas abusivas con confirmación del admin:
  [[ACTION: {"action": "admin_moderate_solicitud", "id": 12, "nombre": "...", "status": "aprobado"|"rechazado"}]]
  [[ACTION: {"action": "admin_delete_resena", "id": 15, "titulo": "..."}]]`,
};

function buildSystemPrompt(role: UserRole, contextText: string): string {
  return `Eres el asistente integrado de GastroCocha, la Guía Gastronómica de las 16 provincias de Cochabamba, Bolivia.
Tu ÚNICA fuente de verdad son los datos reales en [CONTEXTO] abajo.

${ROLE_CAPABILITIES[role]}

REGLAS DE COMPORTAMIENTO:
1. Jamás inventes platos, locales, direcciones, coordenadas ni puntajes. Verifica en [TODOS LOS LOCALES ACTIVOS Y APROBADOS] y [TODOS LOS PLATOS TÍPICOS ACTIVOS] antes de afirmar que algo no existe.
2. Si el usuario dice "este plato" o "este negocio", revisa [PÁGINA ACTUAL DEL USUARIO] para resolver automáticamente de cuál se trata sin volver a preguntarle.
3. Si [UBICACIÓN GPS DEL USUARIO ACTIVA] aparece en el contexto y el usuario pide un negocio cercano o "ir a la página de un negocio cerca de mí", usa directamente el primer local listado (el de menor distancia km) y navega a su ruta /negocio/<slug>. No vuelvas a pedirle su dirección.
4. Si pregunta por "el mejor plato" o pide ver el ranking, responde con el #1 de [RANKING REAL DE PLATOS] y navega a /ranking (o a la ruta de ese plato si pide abrir su ficha).
5. Para reseñas (solo si el rol NO es guest): cuando tengas el plato o local (de la página actual o del mensaje), una calificación (redondeada a entero 1..5; si dice 4.6 aclara que se registra como 5 estrellas) y un comentario, anexa confirm_review.
6. Responde siempre en español cálido y conciso. No uses rutas ni acciones fuera de tu rol.

[FORMATO DE ACCIÓN — MÁXIMO UN BLOQUE JSON AL FINAL ABSOLUTO]
[[ACTION: {"action": "navigate", "url": "/ranking"}]]
[[ACTION: {"action": "navigate", "url": "/negocio/<slug>"}]]
[[ACTION: {"action": "navigate", "url": "/plato/<slug>"}]]
[[ACTION: {"action": "navigate", "url": "/provincia/<slug>"}]]
[[ACTION: {"action": "focus_map", "lat": -17.3941, "lng": -66.2183, "label": "Nombre"}]]
[[ACTION: {"action": "filter_list", "max_price": 30}]]
[[ACTION: {"action": "filter_negocios", "query": "texto", "provincia": "Nombre Provincia"}]]
[[ACTION: {"action": "select_map_province", "slug": "quillacollo"}]]
[[ACTION: {"action": "fill_form", "nombre": "...", "direccion": "...", "telefono": "...", "provincia": "...", "platos": "..."}]]
[[ACTION: {"action": "confirm_review", "plato_slug": "pichon-de-cliza", "plato_nombre": "Pichón de Cliza", "lugar_slug": "feria-del-pichon-dona-maria", "lugar_nombre": "Feria del Pichón - Doña María", "rating": 5, "comentario": "..."}]]

[CONTEXTO]
${contextText}`;
}

const queryCache = new Map<string, { reply: string; action: ChatbotAction | null; expires: number }>();
const ipLimiter = new Map<string, { count: number; resetTime: number }>();
const userLimiter = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages = [], user_lat, user_lng, budget, pathname = "/" } = body;
    const now = Date.now();

    // 1. IP Rate Limiter (30/hour)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const limitInfo = ipLimiter.get(ip);
    if (limitInfo) {
      if (now > limitInfo.resetTime) {
        ipLimiter.set(ip, { count: 1, resetTime: now + 60 * 60 * 1000 });
      } else {
        limitInfo.count += 1;
        if (limitInfo.count > 30) {
          return NextResponse.json({
            reply: "Límite de seguridad alcanzado. Has realizado demasiadas consultas en poco tiempo; espera unos minutos para continuar.",
            action: null,
          });
        }
      }
    } else {
      ipLimiter.set(ip, { count: 1, resetTime: now + 60 * 60 * 1000 });
    }

    // 2. Session & Role resolution + daily quota
    const session = await getSession();
    const role: UserRole = session?.role ?? "guest";
    const isLogged = !!session;
    let guestCount = 0;

    if (!isLogged) {
      const countCookie = request.cookies.get("gastro_chat_count");
      guestCount = countCookie ? parseInt(countCookie.value, 10) : 0;
      if (guestCount >= 10) {
        return NextResponse.json({
          reply: "Alcanzaste el límite gratuito de 10 consultas diarias como invitado. Inicia sesión o crea una cuenta para disfrutar de hasta 50 consultas diarias.",
          action: { action: "navigate", url: "/login" } satisfies ChatbotAction,
          role,
        });
      }
    } else {
      const email = session.email;
      const uLimit = userLimiter.get(email);
      if (uLimit) {
        if (now > uLimit.resetTime) {
          userLimiter.set(email, { count: 1, resetTime: now + 24 * 60 * 60 * 1000 });
        } else {
          if (uLimit.count >= 50) {
            return NextResponse.json({
              reply: "Alcanzaste tu límite de 50 consultas diarias para cuentas registradas. Regresa mañana para seguir explorando.",
              action: null,
              role,
            });
          }
          uLimit.count += 1;
        }
      } else {
        userLimiter.set(email, { count: 1, resetTime: now + 24 * 60 * 60 * 1000 });
      }
    }

    const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop()?.content || "";

    // Bloqueo inmediato y firme ante insultos o comentarios dañinos/ofensivos (sin IA)
    if (checkOffensiveContent(lastUserMsg).isOffensive) {
      return NextResponse.json({
        reply: OFFENSIVE_CHAT_WARNING,
        action: null,
        role,
      });
    }

    const cleanQuery = lastUserMsg.trim().toLowerCase();
    const hasCoords = typeof user_lat === "number" && typeof user_lng === "number";
    const cacheKey = buildChatbotCacheKey(role, String(pathname || "/"), cleanQuery, hasCoords);

    if (cacheKey) {
      const cached = queryCache.get(cacheKey);
      if (cached && now < cached.expires) {
        return NextResponse.json({ reply: cached.reply, action: cached.action, role });
      }
    }

    const ctxResult = await getFullChatbotContext({
      lat: typeof user_lat === "number" ? user_lat : undefined,
      lng: typeof user_lng === "number" ? user_lng : undefined,
      budget: typeof budget === "number" ? budget : undefined,
      role,
      userEmail: session?.email,
      pathname: typeof pathname === "string" ? pathname : "/",
    });

    // 3. Intercept trivial greetings/thanks/help
    const q = cleanQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const isGreeting = /^(hola|buenos dias|buenas tardes|buenas noches|buenas|hey|ola|hi|que tal|saludos|como estas|como te va)$/.test(q);
    const asksThanks = /^(gracias|genial|perfecto|excelente|chevere|bueno|ok|gracias!|muchas gracias|entendido)$/.test(q);
    const asksHelp = /^(ayuda|como funciona|que puedes hacer|que haces|help|quien eres)$/.test(q);

    if (isGreeting || asksThanks || asksHelp) {
      const mock = generateMockReply(lastUserMsg, role, ctxResult);
      if (cacheKey) {
        queryCache.set(cacheKey, { reply: mock.reply, action: mock.action, expires: now + 60 * 60 * 1000 });
      }
      return NextResponse.json({ reply: mock.reply, action: mock.action, role });
    }

    const systemMessage = buildSystemPrompt(role, ctxResult.contextText);
    let rawReply = "";
    let usedLLM = false;

    // Option A: Gemini
    if (GEMINI_API_KEY) {
      const firstUserIndex = messages.findIndex((m: { role: string }) => m.role === "user");
      const activeHistory = firstUserIndex !== -1 ? messages.slice(firstUserIndex) : messages;
      const formattedMessages = activeHistory.slice(-8).map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      if (formattedMessages.length === 0 || formattedMessages[formattedMessages.length - 1].role !== "user") {
        formattedMessages.push({ role: "user", parts: [{ text: lastUserMsg }] });
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      let res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: formattedMessages,
          system_instruction: { parts: [{ text: systemMessage }] },
          generationConfig: { temperature: 0.2, maxOutputTokens: 1800 },
        }),
      });

      if (!res.ok) {
        const liteUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
        res = await fetch(liteUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: formattedMessages,
            system_instruction: { parts: [{ text: systemMessage }] },
            generationConfig: { temperature: 0.2, maxOutputTokens: 1800 },
          }),
        });
      }

      if (res.ok) {
        const geminiData = await res.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          rawReply = text;
          usedLLM = true;
        }
      }
    }

    // Option B: DeepSeek fallback
    if (!usedLLM && DEEPSEEK_API_KEY) {
      const res = await fetch(DEEPSEEK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "system", content: systemMessage }, ...messages.slice(-8)],
          max_tokens: 1500,
          temperature: 0.2,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          rawReply = text;
          usedLLM = true;
        }
      }
    }

    // Option C: Deterministic smart fallback (always responds)
    let cleanReply = "";
    let safeAction: ChatbotAction | null = null;

    if (usedLLM && rawReply) {
      const parsed = parseChatbotAction(rawReply);
      cleanReply = parsed.cleanReply || "Aquí tienes la información.";
      if (parsed.action && isActionAllowedForRole(parsed.action, role)) {
        if (
          parsed.action.action === "confirm_review" &&
          checkOffensiveContent(parsed.action.comentario, parsed.action.titulo).isOffensive
        ) {
          cleanReply = OFFENSIVE_CHAT_WARNING;
          safeAction = null;
        } else {
          safeAction = parsed.action;
        }
      }
    } else {
      const mock = generateMockReply(lastUserMsg, role, ctxResult);
      cleanReply = mock.reply;
      safeAction = mock.action && isActionAllowedForRole(mock.action, role) ? mock.action : null;
    }

    if (cacheKey && cleanReply && !cleanReply.includes("Hubo un error")) {
      queryCache.set(cacheKey, { reply: cleanReply, action: safeAction, expires: now + 10 * 60 * 1000 });
    }

    const response = NextResponse.json({ reply: cleanReply, action: safeAction, role });
    if (!isLogged) {
      response.cookies.set("gastro_chat_count", String(guestCount + 1), {
        maxAge: 60 * 60 * 24,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
    }
    return response;
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json(
      { reply: "Hubo un error procesando tu mensaje. Intenta de nuevo.", action: null },
      { status: 500 }
    );
  }
}

function generateMockReply(
  question: string,
  role: UserRole,
  ctx: FullChatbotContextResult
): { reply: string; action: ChatbotAction | null } {
  const q = question.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (/^(hola|buenos dias|buenas tardes|buenas noches|buenas|hey|ola|hi|que tal|saludos)/.test(q)) {
    return {
      reply:
        "¡Hola! Soy tu asistente gastronómico de Cochabamba. Puedo recomendarte platos y locales reales, llevarte al ranking, abrir fichas de platos o negocios y usar tu GPS para encontrar el lugar más cercano.",
      action: null,
    };
  }

  if (/^(gracias|genial|perfecto|excelente|chevere|bueno|ok)/.test(q)) {
    return {
      reply: "¡Con mucho gusto! Cuando quieras seguir explorando la gastronomía de Cochabamba, aquí estoy.",
      action: null,
    };
  }

  if (/^(ayuda|como funciona|que puedes|que haces|help|quien eres)/.test(q)) {
    return {
      reply:
        "Puedo ayudarte a navegar por GastroCocha:\n• \"Quiero ver el mejor plato de Cochabamba\"\n• \"Llévame a la página de un negocio cerca de mí\"\n• \"Muéstrame platos de menos de 30 Bs\"\n• \"Deja una reseña a este plato\" (con sesión iniciada)",
      action: null,
    };
  }

  // Restricted panel checks
  if (/(panel admin|ir a admin|aprobar solicitud|moderar resena)/.test(q) && role !== "admin") {
    return {
      reply: "El panel de administración solo está disponible para cuentas con rol de administrador.",
      action: role === "guest" ? { action: "navigate", url: "/login" } : null,
    };
  }

  if (/(mi negocio|panel propietario|editar mi local)/.test(q) && role !== "owner") {
    return {
      reply: "El panel de propietario solo está disponible para cuentas vinculadas como dueños de un local.",
      action: role === "guest" ? { action: "navigate", url: "/login" } : null,
    };
  }

  // Review intent on current page
  if (/(resena|resenar|calificar|estrellas|me gusto)/.test(q)) {
    if (role === "guest") {
      return {
        reply: "Para publicar una reseña en GastroCocha primero debes iniciar sesión. Te llevo a la pantalla de acceso.",
        action: { action: "navigate", url: "/login" },
      };
    }
    if (ctx.currentPageInfo?.type === "plato" || ctx.currentPageInfo?.type === "negocio") {
      const ratingMatch = q.match(/(\d+(?:[.,]\d+)?)/);
      const rating = ratingMatch ? normalizeReviewRating(ratingMatch[1].replace(",", ".")) : 5;
      return {
        reply: `Preparé tu reseña para ${ctx.currentPageInfo.nombre} con ${rating} estrellas. Confírmala abajo para enviarla a moderación.`,
        action: {
          action: "confirm_review",
          plato_slug: ctx.currentPageInfo.type === "plato" ? ctx.currentPageInfo.slug : undefined,
          plato_nombre: ctx.currentPageInfo.type === "plato" ? ctx.currentPageInfo.nombre : undefined,
          lugar_slug: ctx.currentPageInfo.type === "negocio" ? ctx.currentPageInfo.slug : undefined,
          lugar_nombre: ctx.currentPageInfo.type === "negocio" ? ctx.currentPageInfo.nombre : undefined,
          rating,
          comentario: question.trim(),
        },
      };
    }
  }

  // Navigate to nearest business page
  if (/(cerca|cercano|pagina de un negocio|sitio de un negocio|local cerca)/.test(q)) {
    if (ctx.nearestPlace) {
      return {
        reply: `El local más cercano a tu ubicación es ${ctx.nearestPlace.nombre} (a ${ctx.nearestPlace.km.toFixed(1)} km${ctx.nearestPlace.direccion ? `, ${ctx.nearestPlace.direccion}` : ""}). Abriendo su ficha.`,
        action: { action: "navigate", url: `/negocio/${ctx.nearestPlace.slug}` },
      };
    }
    return {
      reply: "Activa el permiso de ubicación en tu navegador o dime en qué provincia estás para mostrarte los locales cercanos.",
      action: { action: "navigate", url: "/negocios" },
    };
  }

  // Best dish / Ranking
  if (/(mejor plato|top|ranking|mas votado|recomendado)/.test(q)) {
    if (ctx.topDish) {
      return {
        reply: `El plato mejor calificado en GastroCocha es ${ctx.topDish.nombre} (★${ctx.topDish.rating.toFixed(1)}, ${ctx.topDish.total_resenas} reseñas). Te llevo al Ranking Gastronómico.`,
        action: { action: "navigate", url: "/ranking" },
      };
    }
    return {
      reply: "Te llevo al Ranking Gastronómico para que veas los platos mejor calificados.",
      action: { action: "navigate", url: "/ranking" },
    };
  }

  // Budget filter
  const budgetMatch = q.match(/(\d+)\s*(bs|bolivianos|pesos)?/);
  if (/(barato|economico|menos de|presupuesto)/.test(q) && budgetMatch) {
    const maxPrice = parseInt(budgetMatch[1], 10);
    return {
      reply: `Filtrando platos con precio de hasta ${maxPrice} Bs.`,
      action: { action: "filter_list", max_price: maxPrice },
    };
  }

  return {
    reply:
      "Puedo llevarte al Ranking (/ranking), buscar negocios (/negocios), abrir la ficha de un plato o local, o usar tu GPS para abrir el restaurante más cercano. ¿Qué te gustaría explorar?",
    action: null,
  };
}
