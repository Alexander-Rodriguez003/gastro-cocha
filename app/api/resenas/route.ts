import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createResenaBySlug } from "@/lib/data";
import { sanitizeText, sanitizeOptionalText, sanitizeName } from "@/lib/validation";
import { normalizeReviewRating } from "@/lib/chatbot-rules";
import { checkOffensiveContent, OFFENSIVE_REVIEW_WARNING } from "@/lib/moderation";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    const platoSlug = typeof body.plato_slug === "string" ? body.plato_slug.trim() : undefined;
    const lugarSlug = typeof body.lugar_slug === "string" ? body.lugar_slug.trim() : undefined;
    const comentario = sanitizeText(body.comentario ?? "", 600);
    const titulo = sanitizeOptionalText(body.titulo ?? "", 150);
    const guestNameRaw = sanitizeName(body.author_name ?? "", 60);
    const rating = normalizeReviewRating(body.rating);

    if (!platoSlug && !lugarSlug) {
      return NextResponse.json(
        { error: "Debes especificar el plato o el local a calificar." },
        { status: 400 }
      );
    }

    if (comentario.length < 5) {
      return NextResponse.json(
        { error: "El comentario debe tener al menos 5 caracteres." },
        { status: 400 }
      );
    }

    // Filtro determinista sin IA contra lenguaje ofensivo / insultos
    const moderation = checkOffensiveContent(guestNameRaw, titulo, comentario);
    if (moderation.isOffensive) {
      return NextResponse.json(
        { error: OFFENSIVE_REVIEW_WARNING, offensive: true },
        { status: 400 }
      );
    }

    const created = await createResenaBySlug({
      userId: session?.id ?? null,
      guestName: !session ? (guestNameRaw || "Visitante") : null,
      platoSlug,
      lugarSlug,
      rating,
      titulo: titulo || null,
      comentario,
    });

    if (!created) {
      return NextResponse.json(
        { error: "No se encontró el plato o local indicado." },
        { status: 404 }
      );
    }

    const authorDisplay = session?.name || created.authorName;

    return NextResponse.json({
      success: true,
      resena: {
        id: created.id,
        user_id: session?.id ?? 0,
        plato_id: null,
        lugar_id: null,
        rating,
        titulo: titulo || null,
        comentario,
        fecha_visita: new Date().toISOString().split("T")[0],
        is_approved: true,
        user: { id: session?.id ?? 0, name: authorDisplay },
      },
      message: "Tu reseña ha sido publicada.",
    });
  } catch (error) {
    console.error("Error creating resena:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
