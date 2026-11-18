import type { Metadata } from "next";
import { getPlatoDetail } from "@/lib/data";
import { notFound } from "next/navigation";
import { PlatoDetailView } from "@/components/PlatoDetailView";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPlatoDetail(slug);
  if (!data) {
    return { title: "Plato no encontrado" };
  }
  const { plato } = data;
  const prov = plato.provincia ? ` de ${plato.provincia.nombre}` : "";
  const description = plato.descripcion || `Descubre dónde comer ${plato.nombre}${prov}, su historia e ingredientes típicos en Cochabamba.`;
  return {
    title: `${plato.nombre}${prov}`,
    description,
    openGraph: {
      title: `${plato.nombre} | GastroCocha`,
      description,
      images: plato.imagen_url ? [{ url: plato.imagen_url, alt: plato.nombre }] : undefined,
    },
  };
}

export default async function PlatoPage({ params }: Props) {
  const { slug } = await params;
  const data = await getPlatoDetail(slug);
  if (!data) notFound();

  const { plato, lugares, resenas } = data;

  return <PlatoDetailView initialPlato={plato} lugares={lugares} resenas={resenas} />;
}
