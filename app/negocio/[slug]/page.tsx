import { getLugarDetail } from "@/lib/data";
import { NegocioDetailView } from "@/components/NegocioDetailView";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    slug: string;
  }>;
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
