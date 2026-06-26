import { NextRequest, NextResponse } from "next/server";
import { getLugaresByProvincia } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provincia = searchParams.get("provincia") || undefined;
    const lugares = await getLugaresByProvincia(provincia);
    const data = lugares.map(l => ({
      id: l.id,
      nombre: l.nombre,
      slug: l.slug,
      lat: l.lat,
      lng: l.lng,
      direccion: l.direccion,
    }));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load places" }, { status: 500 });
  }
}
