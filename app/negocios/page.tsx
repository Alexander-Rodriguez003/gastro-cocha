import { Suspense } from "react";
import { getLugaresByProvincia } from "@/lib/data";
import { NegociosGrid } from "@/components/NegociosGrid";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Negocios y Restaurantes | GastroCocha",
  description: "Explora los mejores y más tradicionales locales y pensiones gastronómicas de Cochabamba.",
};

export default async function NegociosPage() {
  const places = await getLugaresByProvincia();

  return (
    <Suspense fallback={null}>
      <NegociosGrid initialLugares={places} />
    </Suspense>
  );
}
