import { NextResponse } from "next/server";
import { getAllProvincias } from "@/lib/data";

export async function GET() {
  try {
    const provincias = await getAllProvincias();
    const data = provincias.map(p => ({
      nombre: p.nombre,
      slug: p.slug,
      centro_lat: p.centro_lat,
      centro_lng: p.centro_lng,
      zoom_mapa: p.zoom_mapa,
    }));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load provinces" }, { status: 500 });
  }
}
