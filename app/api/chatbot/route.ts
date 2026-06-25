import { NextRequest, NextResponse } from "next/server";
import { getChatbotContext, getStaticGastroDatabase } from "@/lib/data";
import { getSession } from "@/lib/auth";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `Eres el asistente gastronómico oficial de GastroCocha, la Guía Gastronómica de Cochabamba, Bolivia.
Tu única fuente de verdad es la información de la base de datos de Cochabamba proporcionada en {CONTEXT}.
Además, aquí tienes el registro completo de todas las provincias y sus platos típicos de GastroCocha (usa esta lista cuando te pregunten por los platos de cada provincia):
{STATIC_DATABASE}

Tu misión es recomendar platos típicos y restaurantes reales de forma cálida, servicial y exacta.

Reglas Estrictas:
1. Jamás inventes restaurantes, direcciones, teléfonos, precios ni platos típicos.
2. Si el usuario te pregunta por platos o restaurantes fuera de Cochabamba (como comida de México, España, etc.), dile amablemente que tu especialidad y base de conocimiento solo abarca las 16 provincias de Cochabamba.
3. Si el usuario te pide recetas complicadas o temas no relacionados a dónde comer en Cochabamba, guíalo amablemente de regreso a buscar restaurantes y platos en el sitio.
4. Cuando el usuario comparte su ubicación, prioriza los locales más cercanos (incluyendo pequeños restaurantes de carretera).
5. Cuando menciona un presupuesto en Bolivianos (Bs), filtra estrictamente dentro de ese rango.
6. Cuando pide "el mejor", ordena por rating sin importar distancia.
7. Responde siempre en español con calidez boliviana.

[ACCIONES Y EVENTOS INTERACTIVOS EN LA WEB]
Si detectas que el usuario te pide una acción física o interactiva en la web (como mostrar en el mapa, navegar, rellenar el formulario de registro, filtrar precios o agregar una reseña), DEBES anexar un único bloque JSON al final absoluto de tu respuesta con este formato exacto en una sola línea:
[[ACTION: {"action": "focus_map", "lat": latitud_numerica, "lng": longitud_numerica, "label": "Nombre del Lugar"}]]
[[ACTION: {"action": "navigate", "url": "/provincia/slug_de_provincia" o "/ranking" o "/registrar-negocio"}]]
[[ACTION: {"action": "fill_form", "nombre": "Nombre sugerido", "direccion": "Dirección sugerida", "telefono": "Teléfono sugerido"}]]
[[ACTION: {"action": "filter_list", "max_price": precio_numerico}]]
[[ACTION: {"action": "add_review", "plato_slug": "slug_del_plato", "rating": rating_numerico, "comentario": "comentario"}]]

Ejemplos de Intenciones que activan acciones:
- "márcame la ubicación de Doña Petrona" o "dónde queda La Quillacolleña" -> [[ACTION: {"action": "focus_map", "lat": -17.3941, "lng": -66.2183, "label": "Parador Km 8 - Doña Petrona"}]]
- "llévame a la sección de platos de Punata" -> [[ACTION: {"action": "navigate", "url": "/provincia/punata"}]]
- "llévame a registrar mi negocio" o "quiero registrar mi local" -> [[ACTION: {"action": "navigate", "url": "/registrar-negocio"}]]
- "ayúdame a rellenar el formulario, mi negocio se llama El Rincón del Chanchito en Sacaba" -> [[ACTION: {"action": "fill_form", "nombre": "El Rincón del Chanchito", "direccion": "Sacaba", "telefono": ""}]]
- "muestra solo platos baratos de menos de 25 pesos" o "filtra platos por debajo de 30 Bs" -> [[ACTION: {"action": "filter_list", "max_price": 30}]]
- "me encantó el fricasé de Doña Petrona, ponle 5 estrellas" -> [[ACTION: {"action": "add_review", "plato_slug": "fricase", "rating": 5, "comentario": "Me encantó el fricasé, excelente sabor"}]]

Regla de Oro: Solo anexa el bloque [[ACTION: ...]] al final de la respuesta conversacional. No inventes coordenadas, usa las del contexto. Si no hay coordenadas reales de un restaurante en tu contexto actual, no uses "focus_map".

Datos actuales de restaurantes y platos activos (Tu Única Verdad):
{CONTEXT}`;

// Simple in-memory cache to save API calls
const queryCache = new Map<string, { reply: string; expires: number }>();
// Simple in-memory IP rate limiter
const ipLimiter = new Map<string, { count: number; resetTime: number }>();
// Simple in-memory rate limiter for logged-in users (email -> { count, resetTime })
const userLimiter = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages = [], user_lat, user_lng, budget } = body;
    const now = Date.now();

    // ---- 1. IP Rate Limiter (Max 30 requests per hour per IP to prevent spam) ----
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || (request as any).ip || "127.0.0.1";
    const limitInfo = ipLimiter.get(ip);
    if (limitInfo) {
      if (now > limitInfo.resetTime) {
        ipLimiter.set(ip, { count: 1, resetTime: now + 60 * 60 * 1000 });
      } else {
        limitInfo.count += 1;
        if (limitInfo.count > 30) {
          return NextResponse.json({
            reply: "⚠️ *Límite de seguridad alcanzado.*\n\nHas realizado demasiadas consultas en un corto periodo de tiempo. Por favor, espera unos minutos para continuar explorando la gastronomía de Cochabamba. 🍽️"
          });
        }
      }
    } else {
      ipLimiter.set(ip, { count: 1, resetTime: now + 60 * 60 * 1000 });
    }

    // ---- 2. Check Auth Session and Enforce Respective Limits ----
    const session = await getSession();
    const isLogged = !!session;
    let guestCount = 0;

    if (!isLogged) {
      // Guest: Cookie-based rate limiting (10 queries per day)
      const countCookie = request.cookies.get("gastro_chat_count");
      guestCount = countCookie ? parseInt(countCookie.value) : 0;

      if (guestCount >= 10) {
        return NextResponse.json({
          reply: "⚠️ *¡Has alcanzado el límite gratuito de 10 consultas diarias como invitado!*\n\nPara evitar abusos de nuestra API, pausamos las consultas de esta sesión. ¡Inicia sesión o crea una cuenta gratuita para disfrutar de un límite de 50 consultas diarias! 🍽️"
        });
      }
    } else {
      // Registered User: In-memory rate limiting (50 queries per day)
      const email = session.email;
      const limitInfo = userLimiter.get(email);
      
      if (limitInfo) {
        if (now > limitInfo.resetTime) {
          userLimiter.set(email, { count: 1, resetTime: now + 24 * 60 * 60 * 1000 });
        } else {
          if (limitInfo.count >= 50) {
            return NextResponse.json({
              reply: "⚠️ *¡Has alcanzado tu límite de 50 consultas diarias para usuarios registrados!*\n\nPara garantizar un servicio rápido y gratuito para toda la comunidad, limitamos las consultas diarias por cuenta. Por favor, regresa mañana para continuar explorando la gastronomía de Cochabamba. 🍽️"
            });
          }
          limitInfo.count += 1;
        }
      } else {
        userLimiter.set(email, { count: 1, resetTime: now + 24 * 60 * 60 * 1000 });
      }
    }

    // Build dynamic context from the database
    const context = await getChatbotContext(user_lat, user_lng, budget);
    const staticDb = await getStaticGastroDatabase();
    
    // ---- 3. Intercept Trivial Messages (Greetings, Thanks, Help) to save API calls ----
    const lastUserMsg = messages.filter((m: any) => m.role === "user").pop()?.content || "";
    const cleanQuery = lastUserMsg.trim().toLowerCase();
    
    // Check if query is in cache
    const cached = queryCache.get(cleanQuery);
    if (cached && now < cached.expires) {
      return NextResponse.json({ reply: cached.reply });
    }

    const q = cleanQuery.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const isGreeting = /^(hola|buenos dias|buenas tardes|buenas noches|buenas|hey|ola|hi|que tal|saludos|como estas|como te va)$/.test(q);
    const asksThanks = /^(gracias|genial|perfecto|excelente|chevere|bueno|ok|gracias!|muchas gracias|entendido)$/.test(q);
    const asksHelp = /^(ayuda|como funciona|que puedes hacer|que haces|help|quien eres)$/.test(q);

    if (isGreeting || asksThanks || asksHelp) {
      const reply = generateMockReply(lastUserMsg, context);
      queryCache.set(cleanQuery, { reply, expires: now + 60 * 60 * 1000 }); // Cache local replies for 1 hour
      return NextResponse.json({ reply });
    }

    const systemMessage = SYSTEM_PROMPT
      .replace("{CONTEXT}", context || "No hay datos disponibles aún.")
      .replace("{STATIC_DATABASE}", staticDb);

    let reply = "No pude procesar tu solicitud.";
    let usedGemini = false;

    // ---- Option A: Google AI Studio (Gemini 2.5 Flash) ----
    if (GEMINI_API_KEY) {
      // Clean chat history to make sure it always starts with a "user" role.
      // Gemini throws a 400 Bad Request error if the first message in the dialog is from the model/assistant.
      const firstUserIndex = messages.findIndex((m: any) => m.role === "user");
      const activeHistory = firstUserIndex !== -1 ? messages.slice(firstUserIndex) : messages;

      const formattedMessages = activeHistory.slice(-8).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      // Double check that history ends with a user turn
      if (formattedMessages.length === 0 || formattedMessages[formattedMessages.length - 1].role !== "user") {
        const lastUser = messages.filter((m: any) => m.role === "user").pop();
        if (lastUser) {
          formattedMessages.push({ role: "user", parts: [{ text: lastUser.content }] });
        }
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      let res = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: formattedMessages,
          system_instruction: {
            parts: [{ text: systemMessage }]
          },
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2000,
          }
        })
      });

      // ---- Fallback to Gemini 2.5 Flash Lite if Google's primary model is experiencing high demand (503) ----
      if (!res.ok) {
        const primaryError = await res.clone().text();
        console.warn("Primary Gemini 2.5 Flash is busy (503/429), switching to Gemini 2.5 Flash Lite... Details:", primaryError);

        const liteUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
        res = await fetch(liteUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: formattedMessages,
            system_instruction: {
              parts: [{ text: systemMessage }]
            },
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2000,
            }
          })
        });
      }

      if (res.ok) {
        const geminiData = await res.json();
        reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta con Gemini.";
        usedGemini = true;
      } else {
        const errorText = await res.text();
        console.error("Gemini API error (both primary and lite failed):", errorText);
      }
    }

    // ---- Option B: DeepSeek API (Optional Fallback) ----
    if (!usedGemini && DEEPSEEK_API_KEY) {
      const apiMessages = [
        { role: "system", content: systemMessage },
        ...messages.slice(-10),
      ];

      const res = await fetch(DEEPSEEK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: apiMessages,
          max_tokens: 1500,
          temperature: 0.2,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        reply = data.choices?.[0]?.message?.content || "No pude generar una respuesta.";
      } else {
        const error = await res.text();
        console.error("DeepSeek API error:", error);
      }
    }

    // ---- Option C: Local Conversational Smart Reply Fallback ----
    if (!usedGemini && !DEEPSEEK_API_KEY) {
      const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop();
      reply = generateMockReply(lastUserMsg?.content || "", context);
    }

    // Cache successful AI responses for 10 minutes (except fallbacks or errors)
    if (reply && reply !== "No pude procesar tu solicitud." && !reply.includes("Hubo un error")) {
      queryCache.set(cleanQuery, { reply, expires: Date.now() + 10 * 60 * 1000 });
    }

    // Return response and increment the daily guest rate limiter cookie if applicable
    const response = NextResponse.json({ reply });
    if (!isLogged) {
      response.cookies.set("gastro_chat_count", String(guestCount + 1), {
        maxAge: 60 * 60 * 24, // 24 hour expiration
        path: "/",
        httpOnly: true,
        sameSite: "lax"
      });
    }
    return response;

  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json({ reply: "Hubo un error procesando tu mensaje. Intenta de nuevo." }, { status: 500 });
  }
}


// Smart fallback when no DeepSeek API key is set
function generateMockReply(question: string, context: string): string {
  const q = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const lines = context.split("\n").filter(l => l.trim());

  // ---- Extract budget from text (e.g. "tengo 30 bs", "menos de 25", "por 20 bolivianos") ----
  const budgetMatch = q.match(/(\d+)\s*(bs|bolivianos|pesos)?/);
  const budget = budgetMatch ? parseInt(budgetMatch[1]) : null;

  // ---- Detect province mentions ----
  const provincias: Record<string, string[]> = {
    cercado: ["cercado", "cochabamba", "ciudad"],
    quillacollo: ["quillacollo", "quilla"],
    chapare: ["chapare", "tropico", "villa tunari"],
    punata: ["punata"],
    "german-jordan": ["cliza", "german jordan"],
    "esteban-arce": ["tarata", "esteban arce"],
    arani: ["arani"],
    carrasco: ["totora", "carrasco"],
    mizque: ["mizque"],
    tiraque: ["tiraque"],
    capinota: ["capinota"],
    tapacari: ["tapacari"],
  };
  let detectedProvincia: string | null = null;
  for (const [slug, keywords] of Object.entries(provincias)) {
    if (keywords.some(k => q.includes(k))) {
      detectedProvincia = slug;
      break;
    }
  }

  // ---- Detect specific dish mentions ----
  const platoKeywords: Record<string, string[]> = {
    silpancho: ["silpancho"],
    "pique-macho": ["pique macho", "pique"],
    chicharron: ["chicharron", "chicharrón"],
    fricase: ["fricase", "fricasé"],
    trucha: ["trucha", "pescado"],
    pichon: ["pichon", "pichón", "paloma"],
    chorizo: ["chorizo", "tarateno", "tarateño"],
    pan: ["pan de arani", "pan"],
    rosquete: ["rosquete", "rosquetes"],
    chajchu: ["chajchu"],
    tambaqui: ["tambaqui", "surubi"],
    lechon: ["lechon", "lechón"],
  };
  let detectedPlato: string | null = null;
  for (const [slug, keywords] of Object.entries(platoKeywords)) {
    if (keywords.some(k => q.includes(k))) {
      detectedPlato = slug;
      break;
    }
  }

  // ---- Intent detection ----
  const isGreeting = /^(hola|buenos dias|buenas|hey|ola|hi|que tal|saludos)/.test(q);
  const asksCheap = /(barato|economico|menos de|por \d|tengo \d|presupuesto|precio bajo|accesible)/.test(q);
  const asksBest = /(mejor|top|ranking|estrella|recomendado|favorito|imperdible|famoso)/.test(q);
  const asksNearby = /(cerca|cercano|por aqui|aqui|ubicacion|donde estoy|al lado|carretera)/.test(q);
  const asksWhat = /(que hay|que tienen|que platos|que puedo|menu|opciones|tipico|probar)/.test(q);
  const asksThanks = /(gracias|genial|perfecto|excelente|chevere|bueno)/.test(q);
  const asksHelp = /(ayuda|como funciona|que puedes|que haces)/.test(q);

  // ---- Filter context lines ----
  let filtered = [...lines];

  if (detectedPlato) {
    const matching = lines.filter(l => l.toLowerCase().includes(detectedPlato!));
    if (matching.length > 0) filtered = matching;
  }

  if (detectedProvincia) {
    const matching = filtered.filter(l => l.toLowerCase().includes(detectedProvincia!));
    if (matching.length > 0) filtered = matching;
  }

  if (budget && budget > 0) {
    const matching = filtered.filter(l => {
      const priceMatch = l.match(/(\d+)\s*Bs/);
      return priceMatch && parseInt(priceMatch[1]) <= budget;
    });
    if (matching.length > 0) filtered = matching;
  }

  const top = filtered.slice(0, 5).join("\n");

  // ---- Generate response ----
  if (isGreeting) {
    return `¡Hola! 👋 ¡Bienvenido a GastroCocha!\n\nSoy tu guía gastronómico de Cochabamba. Puedo ayudarte a encontrar:\n\n🍽️ Platos típicos por nombre\n📍 Restaurantes cerca de ti\n💰 Opciones dentro de tu presupuesto\n🏔️ Comida por provincia\n\n¿Qué se te antoja hoy? 😋`;
  }

  if (asksThanks) {
    return `¡Con mucho gusto! 😊 Si necesitas más recomendaciones, aquí estoy.\n\n¡Que disfrutes la comida cochabambina! 🍽️🇧🇴`;
  }

  if (asksHelp) {
    return `¡Claro! Puedo ayudarte así:\n\n• Pregúntame por un plato: "¿Dónde como silpancho?"\n• Dime tu presupuesto: "Tengo 30 Bs"\n• Pide por zona: "¿Qué hay en el Chapare?"\n• Pide lo mejor: "¿Cuál es el mejor plato?"\n• Activa tu GPS para recomendaciones cercanas\n\n¿Qué te gustaría saber? 🤔`;
  }

  if (detectedPlato && detectedProvincia) {
    return `🔎 ${detectedPlato.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} en la zona de ${detectedProvincia}:\n\n${top || "No encontré resultados exactos, pero te sugiero visitar la provincia para descubrir opciones locales."}\n\n¿Te gustaría saber más detalles de alguno? 📋`;
  }

  if (detectedPlato) {
    return `🍽️ ¡${detectedPlato.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}! Excelente elección.\n\nEstos son los lugares donde lo sirven:\n\n${top}\n\n¿Quieres que filtre por precio o zona? 💡`;
  }

  if (detectedProvincia) {
    const provName = detectedProvincia.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `🏔️ Gastronomía de ${provName}:\n\n${top || "Aún no tengo muchos locales registrados en esta zona, ¡pero estamos creciendo!"}\n\n¿Buscas algo específico? Puedo filtrar por presupuesto 💰`;
  }

  if (asksCheap && budget) {
    return `💰 Opciones por ${budget} Bs o menos:\n\n${top || "No encontré opciones en ese rango. Intenta con un presupuesto un poco mayor."}\n\n¡La comida cochabambina es deliciosa y accesible! 🤑`;
  }

  if (asksCheap) {
    return `💰 ¡Opciones económicas en Cochabamba!\n\n${top}\n\n💡 Tip: Dime un monto (ej: "tengo 25 Bs") y filtro exactamente para ti.`;
  }

  if (asksBest) {
    return `🏆 ¡Los mejor calificados de Cochabamba!\n\n${top}\n\n⭐ Estos tienen las mejores reseñas de nuestros usuarios. ¿Cuál te llama la atención?`;
  }

  if (asksNearby) {
    return `📍 Según tu ubicación, lo más cercano:\n\n${top}\n\n💡 Tip: Asegúrate de permitir el acceso a tu GPS para mejores resultados. ¿Quieres que filtre por presupuesto también?`;
  }

  if (asksWhat) {
    return `🍽️ ¡Hay mucho por probar en Cochabamba!\n\n${top}\n\n🌶️ ¿Te interesa alguna provincia en particular o un tipo de comida? Puedo ser más específico.`;
  }

  // Default — conversational fallback
  return `🍽️ Según lo que buscas, te recomiendo:\n\n${top}\n\n💡 También puedes preguntarme:\n• "Silpancho barato"\n• "¿Qué hay en Tarata?"\n• "Tengo 20 Bs, ¿dónde como?"\n• "Lo mejor de Cochabamba"`;
}
