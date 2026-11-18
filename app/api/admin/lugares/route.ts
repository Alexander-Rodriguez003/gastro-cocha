import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import {
  getLugaresAdminList,
  createLugarAdmin,
  updateLugarAdmin,
  deleteLugarAdmin,
} from "@/lib/data";
import {
  sanitizeName,
  sanitizeText,
  sanitizePhone,
  sanitizeNumber,
  isValidImageRef,
  isValidLatitude,
  isValidLongitude,
} from "@/lib/validation";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const lugares = await getLugaresAdminList();
    return NextResponse.json({ success: true, lugares });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      const nombre = sanitizeName(body.nombre, 150);
      if (nombre.length < 2) {
        return NextResponse.json({ error: "El nombre del local no es válido" }, { status: 400 });
      }
      const provincia_slug = sanitizeText(body.provincia_slug, 120);
      if (!provincia_slug) {
        return NextResponse.json({ error: "Selecciona una provincia" }, { status: 400 });
      }
      if (!isValidLatitude(body.lat) || !isValidLongitude(body.lng)) {
        return NextResponse.json({ error: "Coordenadas GPS no válidas" }, { status: 400 });
      }
      const imagen = body.imagen_url ? String(body.imagen_url) : null;
      if (imagen && !isValidImageRef(imagen)) {
        return NextResponse.json({ error: "La imagen debe ser una URL http(s) o una ruta interna" }, { status: 400 });
      }

      const lugar = await createLugarAdmin({
        nombre,
        provincia_slug,
        direccion: body.direccion ? sanitizeText(body.direccion, 255) : null,
        telefono: body.telefono ? sanitizePhone(body.telefono) : null,
        lat: Number(body.lat),
        lng: Number(body.lng),
        activo: body.activo !== false,
        aprobado: body.aprobado !== false,
        imagen_url: imagen,
      });
      return NextResponse.json({ success: true, lugar });
    }

    if (action === "update") {
      const id = sanitizeNumber(body.id);
      if (!id) return NextResponse.json({ error: "ID no válido" }, { status: 400 });

      const patch: Record<string, unknown> = {};

      if (body.nombre !== undefined) {
        const nombre = sanitizeName(body.nombre, 150);
        if (nombre.length < 2) {
          return NextResponse.json({ error: "El nombre del local no es válido" }, { status: 400 });
        }
        patch.nombre = nombre;
      }
      if (body.provincia_slug !== undefined) {
        const slug = sanitizeText(body.provincia_slug, 120);
        if (!slug) return NextResponse.json({ error: "Provincia no válida" }, { status: 400 });
        patch.provincia_slug = slug;
      }
      if (body.direccion !== undefined) {
        patch.direccion = body.direccion ? sanitizeText(body.direccion, 255) : null;
      }
      if (body.telefono !== undefined) {
        patch.telefono = body.telefono ? sanitizePhone(body.telefono) : null;
      }
      if (body.lat !== undefined) {
        if (!isValidLatitude(body.lat)) {
          return NextResponse.json({ error: "Latitud no válida" }, { status: 400 });
        }
        patch.lat = Number(body.lat);
      }
      if (body.lng !== undefined) {
        if (!isValidLongitude(body.lng)) {
          return NextResponse.json({ error: "Longitud no válida" }, { status: 400 });
        }
        patch.lng = Number(body.lng);
      }
      if (body.activo !== undefined) patch.activo = !!body.activo;
      if (body.aprobado !== undefined) patch.aprobado = !!body.aprobado;
      if (body.imagen_url !== undefined) {
        const imagen = body.imagen_url ? String(body.imagen_url) : null;
        if (imagen && !isValidImageRef(imagen)) {
          return NextResponse.json({ error: "La imagen debe ser una URL http(s) o una ruta interna" }, { status: 400 });
        }
        patch.imagen_url = imagen;
      }

      await updateLugarAdmin(id, patch as any);
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      const id = sanitizeNumber(body.id);
      if (!id) return NextResponse.json({ error: "ID no válido" }, { status: 400 });
      await deleteLugarAdmin(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error del servidor" }, { status: 500 });
  }
}
