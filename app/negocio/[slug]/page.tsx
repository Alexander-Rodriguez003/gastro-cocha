import type { Metadata } from "next";
import { getLugarDetail } from "@/lib/data";
import { NegocioDetailView } from "@/components/NegocioDetailView";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getLugarDetail(slug);
  if (!detail) {
    return { title: "Local no encontrado" };
  }
  const { lugar } = detail;
  const prov = lugar.provincia ? ` (${lugar.provincia.nombre})` : "";
  const description =
    lugar.descripcion ||
    `${lugar.nombre}${prov}${lugar.direccion ? ` — ${lugar.direccion}` : ""}. Menú típico, precios y ubicación en GastroCocha.`;
  return {
    title: `${lugar.nombre}${prov}`,
    description,
    openGraph: {
      title: `${lugar.nombre} | GastroCocha`,
      description,
      images: lugar.imagen_url ? [{ url: lugar.imagen_url, alt: lugar.nombre }] : undefined,
    },
  };
}

export default async function NegocioPage({ params }: Props) {
  const { slug } = await params;
  const detail = await getLugarDetail(slug);

  if (!detail) {
    notFound();
  }

  return (
    <NegocioDetailView
      initialLugar={detail.lugar}
      platos={detail.platos}
      resenas={detail.resenas}
    />
  );
}
