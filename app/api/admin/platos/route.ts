import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import {
  getPlatosAdmin,
  createPlatoAdmin,
  updatePlatoAdmin,
  deletePlatoAdmin,
} from "@/lib/data";
import {
  sanitizeName,
  sanitizeText,
  sanitizeNumber,
  isValidImageRef,
} from "@/lib/validation";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const platos = await getPlatosAdmin();
    return NextResponse.json({ success: true, platos });
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
        return NextResponse.json({ error: "El nombre del plato no es válido" }, { status: 400 });
      }
      const provincia_slug = sanitizeText(body.provincia_slug, 120);
      if (!provincia_slug) {
        return NextResponse.json({ error: "Selecciona una provincia" }, { status: 400 });
      }
      const precio = sanitizeNumber(body.precio_referencial);
      if (precio !== null && precio < 0) {
        return NextResponse.json({ error: "El precio no puede ser negativo" }, { status: 400 });
      }
      const imagen = body.imagen_url ? String(body.imagen_url) : null;
      if (imagen && !isValidImageRef(imagen)) {
        return NextResponse.json({ error: "La imagen debe ser una URL http(s) o una ruta interna" }, { status: 400 });
      }

      const plato = await createPlatoAdmin({
        nombre,
        provincia_slug,
        precio_referencial: precio,
        destacado: !!body.destacado,
        activo: body.activo !== false,
        imagen_url: imagen,
        descripcion: body.descripcion ? sanitizeText(body.descripcion, 1000) : "",
      });
      return NextResponse.json({ success: true, plato });
    }

    if (action === "update") {
      const id = sanitizeNumber(body.id);
      if (!id) return NextResponse.json({ error: "ID no válido" }, { status: 400 });

      const patch: Record<string, unknown> = {};

      if (body.nombre !== undefined) {
        const nombre = sanitizeName(body.nombre, 150);
        if (nombre.length < 2) {
          return NextResponse.json({ error: "El nombre del plato no es válido" }, { status: 400 });
        }
        patch.nombre = nombre;
      }
      if (body.provincia_slug !== undefined) {
        const slug = sanitizeText(body.provincia_slug, 120);
        if (!slug) return NextResponse.json({ error: "Provincia no válida" }, { status: 400 });
        patch.provincia_slug = slug;
      }
      if (body.precio_referencial !== undefined) {
        const precio = sanitizeNumber(body.precio_referencial);
        if (precio !== null && precio < 0) {
          return NextResponse.json({ error: "El precio no puede ser negativo" }, { status: 400 });
        }
        patch.precio_referencial = precio;
      }
      if (body.destacado !== undefined) patch.destacado = !!body.destacado;
      if (body.activo !== undefined) patch.activo = !!body.activo;
      if (body.imagen_url !== undefined) {
        const imagen = body.imagen_url ? String(body.imagen_url) : null;
        if (imagen && !isValidImageRef(imagen)) {
          return NextResponse.json({ error: "La imagen debe ser una URL http(s) o una ruta interna" }, { status: 400 });
        }
        patch.imagen_url = imagen;
      }

      await updatePlatoAdmin(id, patch as any);
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      const id = sanitizeNumber(body.id);
      if (!id) return NextResponse.json({ error: "ID no válido" }, { status: 400 });
      await deletePlatoAdmin(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error del servidor" }, { status: 500 });
  }
}
