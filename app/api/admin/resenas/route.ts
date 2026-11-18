import { NextRequest, NextResponse } from "next/server";
import { getReviewsAdmin, deleteReviewAdmin } from "@/lib/data";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const resenas = await getReviewsAdmin();
    const mapped = resenas.map((r) => {
      const isLugar = Boolean(r.lugar_id);
      return {
        id: r.id,
        targetType: isLugar ? ("lugar" as const) : ("plato" as const),
        targetName: isLugar
          ? r.lugar?.nombre || `Local #${r.lugar_id}`
          : r.plato?.nombre || `Plato #${r.plato_id}`,
        targetSlug: isLugar ? r.lugar?.slug || "" : r.plato?.slug || "",
        rating: r.rating,
        titulo: r.titulo || "",
        comentario: r.comentario,
        usuario: r.user?.name || "Visitante",
        fecha: r.fecha_visita || (r.created_at ? r.created_at.split("T")[0] : "—"),
      };
    });

    return NextResponse.json({ resenas: mapped });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    let id = idParam ? Number(idParam) : NaN;
    if (Number.isNaN(id)) {
      const body = await request.json().catch(() => ({}));
      id = Number(body.id);
    }

    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "ID de reseña requerido" }, { status: 400 });
    }

    const ok = await deleteReviewAdmin(id);
    if (!ok) {
      return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
