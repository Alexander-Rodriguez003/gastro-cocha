import { getPlatoDetail } from "@/lib/data";
import { notFound } from "next/navigation";
import { PlatoDetailView } from "@/components/PlatoDetailView";

export default async function PlatoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPlatoDetail(slug);
  if (!data) notFound();

  const { plato, lugares, resenas } = data;

  return <PlatoDetailView initialPlato={plato} lugares={lugares} resenas={resenas} />;
}
