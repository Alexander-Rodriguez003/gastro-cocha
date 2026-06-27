import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { 
  getLugarByOwnerEmail, 
  updateLugarDetails, 
  updatePlatoLugarPivot, 
  addSpecialty, 
  deleteSpecialty,
  getLugarDetail
} from "@/lib/data";
import { sanitizeText, sanitizeName, sanitizePhone, isValidUrl, sanitizeNumber } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const lugar = await getLugarByOwnerEmail(session.email);
  if (!lugar) {
    return NextResponse.json({ error: "Negocio no encontrado o no asignado aún." }, { status: 404 });
  }

  const details = await getLugarDetail(lugar.slug);
  return NextResponse.json({ success: true, details });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const lugar = await getLugarByOwnerEmail(session.email);
  if (!lugar) {
    return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const { action } = body;

  if (action === "update_details") {
    const { telefono, direccion, descripcion, imagen_url } = body;
    const ok = await updateLugarDetails(lugar.id, {
      telefono: telefono ? sanitizePhone(telefono) : "",
      direccion: direccion ? sanitizeText(direccion, 255) : "",
      descripcion: descripcion ? sanitizeText(descripcion, 1000) : "",
      imagen_url: imagen_url && isValidUrl(imagen_url) ? imagen_url : undefined,
    });
    return NextResponse.json({ success: ok });
  }

  if (action === "update_plato") {
    const { plato_id, precio_aproximado, imagen_url } = body;
    const precio = sanitizeNumber(precio_aproximado);
    const ok = await updatePlatoLugarPivot(lugar.id, plato_id, {
      precio_aproximado: precio || 0,
      imagen_url: imagen_url && isValidUrl(imagen_url) ? imagen_url : undefined,
    });
    return NextResponse.json({ success: ok });
  }

  if (action === "add_specialty") {
    const { nombre, precio, imagen_url } = body;
    if (!nombre) return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 });
    const cleanName = sanitizeName(nombre, 150);
    if (cleanName.length < 2) {
      return NextResponse.json({ error: "El nombre de la especialidad no es válido" }, { status: 400 });
    }
    const ok = await addSpecialty(lugar.id, {
      nombre: cleanName,
      precio: sanitizeNumber(precio) || 0,
      imagen_url: imagen_url && isValidUrl(imagen_url) ? imagen_url : null,
    });
    return NextResponse.json({ success: ok });
  }

  if (action === "delete_specialty") {
    const { specialty_id } = body;
    const id = sanitizeNumber(specialty_id);
    if (!id) return NextResponse.json({ error: "ID de especialidad no válido" }, { status: 400 });
    const ok = await deleteSpecialty(lugar.id, id);
    return NextResponse.json({ success: ok });
  }

  return NextResponse.json({ error: "Acción no soportada" }, { status: 400 });
}
