import { NextRequest, NextResponse } from "next/server";
import { getReviewsAdmin, updateReviewStatus } from "@/lib/data";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const resenas = await getReviewsAdmin();
    // Map to the structure expected by the frontend
    const mapped = resenas.map((r) => ({
      id: r.id,
      plato_slug: r.plato_id ? "plato-" + r.plato_id : "lugar-" + r.lugar_id,
      tipo: r.lugar_id ? "lugar" : "plato",
      rating: r.rating,
      titulo: r.titulo,
      comentario: r.comentario,
      usuario: r.user?.name || "Anónimo",
      fecha: new Date().toISOString().split("T")[0],
      is_approved: r.is_approved,
      reviewed: (r as any).reviewed || r.is_approved,
    }));

    return NextResponse.json({ resenas: mapped });
  } catch (error) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const body = await request.json();
    const { id, approve } = body;

    if (id === undefined || approve === undefined) {
      return NextResponse.json({ error: "ID y approve son requeridos" }, { status: 400 });
    }

    const success = await updateReviewStatus(Number(id), Boolean(approve));
    if (!success) {
      return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
