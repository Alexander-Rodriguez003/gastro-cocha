import { NextRequest, NextResponse } from "next/server";
import { getProvinciaPorCoordenadas } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");

    if (!latStr || !lngStr) {
      return NextResponse.json({ error: "Missing lat or lng" }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const prov = await getProvinciaPorCoordenadas(lat, lng);
    if (!prov) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json({
      slug: prov.slug,
      nombre: prov.nombre,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to detect province" }, { status: 500 });
  }
}
