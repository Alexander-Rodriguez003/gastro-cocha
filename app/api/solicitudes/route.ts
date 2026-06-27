import { NextRequest, NextResponse } from "next/server";
import { createSolicitud } from "@/lib/data";
import { sanitizeText, sanitizeName, sanitizeEmail, sanitizePhone, isValidEmail, sanitizeOptionalText } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, direccion, telefono, platos, nombre_propietario, email_propietario, provincia, lat, lng, especialidades } = body;

    if (!nombre || !direccion) {
      return NextResponse.json({ error: "Nombre y dirección son requeridos" }, { status: 400 });
    }

    const cleanNombre = sanitizeName(nombre, 150);
    const cleanDireccion = sanitizeText(direccion, 255);
    if (cleanNombre.length < 2) {
      return NextResponse.json({ error: "El nombre del negocio no es válido" }, { status: 400 });
    }

    let cleanEmail: string | null = null;
    if (email_propietario) {
      cleanEmail = sanitizeEmail(email_propietario);
      if (!isValidEmail(cleanEmail)) {
        return NextResponse.json({ error: "El formato del email del propietario no es válido" }, { status: 400 });
      }
    }

    const newSol = await createSolicitud({
      nombre: cleanNombre,
      direccion: cleanDireccion,
      telefono: telefono ? sanitizePhone(telefono) : "",
      nombre_propietario: nombre_propietario ? sanitizeName(nombre_propietario, 150) : "Usuario Web",
      email_propietario: cleanEmail,
      provincia: sanitizeText(provincia || "Cercado", 100),
      lat: lat || -17.3935,
      lng: lng || -66.1570,
      platos_que_sirve: platos ? sanitizeText(platos, 500) : "",
      especialidades: sanitizeOptionalText(especialidades, 500),
    });

    return NextResponse.json({ success: true, solicitud: newSol });
  } catch (error) {
    console.error("Error creating solicitud:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
