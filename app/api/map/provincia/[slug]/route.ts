import { NextRequest, NextResponse } from "next/server";
import { getProvinciaDetail } from "@/lib/data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;
    const detail = await getProvinciaDetail(slug);
    if (!detail) {
      return NextResponse.json({ error: "Province not found" }, { status: 404 });
    }
    return NextResponse.json({
      nombre: detail.provincia.nombre,
      slug: detail.provincia.slug,
      centro_lat: detail.provincia.centro_lat,
      centro_lng: detail.provincia.centro_lng,
      zoom_mapa: detail.provincia.zoom_mapa,
      platos: detail.platos,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load province detail" }, { status: 500 });
  }
}
