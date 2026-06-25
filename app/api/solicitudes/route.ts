import { NextRequest, NextResponse } from "next/server";
import { createSolicitud } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, direccion, telefono, platos, nombre_propietario, email_propietario, provincia, lat, lng, especialidades } = body;

    if (!nombre || !direccion) {
      return NextResponse.json({ error: "Nombre y dirección son requeridos" }, { status: 400 });
    }

    const newSol = await createSolicitud({
      nombre,
      direccion,
      telefono: telefono || "",
      nombre_propietario: nombre_propietario || "Usuario Web",
      email_propietario: email_propietario || null,
      provincia: provincia || "Cercado",
      lat: lat || -17.3935,
      lng: lng || -66.1570,
      platos_que_sirve: platos || "",
      especialidades: especialidades || null,
    });

    return NextResponse.json({ success: true, solicitud: newSol });
  } catch (error) {
    console.error("Error creating solicitud:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
