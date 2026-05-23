import { NextRequest, NextResponse } from "next/server";
import { getChatbotContext } from "@/lib/data";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `Eres el asistente gastronómico oficial de GastroCocha, la Guía Gastronómica de Cochabamba, Bolivia.
Tu misión es recomendar platos típicos y restaurantes de forma cálida y entusiasta.

Reglas:
- Cuando el usuario comparte su ubicación, prioriza los locales más cercanos (incluyendo pequeños restaurantes de carretera).
- Cuando menciona un presupuesto en Bolivianos (Bs), filtra dentro de ese rango.
- Cuando pide "el mejor", ordena por rating sin importar distancia.
- Siempre incluye: nombre del plato, restaurante, precio estimado y ubicación.
- Responde siempre en español de forma amigable.
- Si no tienes datos suficientes, sugiere que visiten la página de la provincia correspondiente.
- Valora mucho a los pequeños negocios locales en carreteras interprovinciales.

Datos actuales de restaurantes y platos activos:
{CONTEXT}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages = [], user_lat, user_lng, budget } = body;

    // Build dynamic context from the database
    const context = await getChatbotContext(user_lat, user_lng, budget);
    const systemMessage = SYSTEM_PROMPT.replace("{CONTEXT}", context || "No hay datos disponibles aún.");

    // If no API key configured, return a mock response based on context
    if (!DEEPSEEK_API_KEY) {
      const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop();
      const mockReply = generateMockReply(lastUserMsg?.content || "", context);
      return NextResponse.json({ reply: mockReply });
    }

    // Call DeepSeek API
    const apiMessages = [
      { role: "system", content: systemMessage },
      ...messages.slice(-10), // Last 10 messages for context window
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
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("DeepSeek API error:", error);
      return NextResponse.json({ reply: "Lo siento, el servicio de IA no está disponible en este momento. Intenta más tarde." });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "No pude generar una respuesta.";

    return NextResponse.json({ reply });
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
