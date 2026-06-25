import { NextRequest, NextResponse } from "next/server";
import { getSolicitudes, updateSolicitudStatus } from "@/lib/data";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const solicitudes = await getSolicitudes();
    return NextResponse.json({ solicitudes });
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID y status son requeridos" }, { status: 400 });
    }

    const success = await updateSolicitudStatus(Number(id), status);
    if (!success) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
