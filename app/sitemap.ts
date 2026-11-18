import type { MetadataRoute } from "next";
import { getAllSlugsForSitemap } from "@/lib/data";

export const dynamic = "force-dynamic";

const SITE_URL = "https://guiagastronomicacohala.dpdns.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/provincias`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/ranking`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/negocios`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/registrar-negocio`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const { provincias, platos, lugares } = await getAllSlugsForSitemap();

  return [
    ...staticRoutes,
    ...provincias.map((slug) => ({
      url: `${SITE_URL}/provincia/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...platos.map((slug) => ({
      url: `${SITE_URL}/plato/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...lugares.map((slug) => ({
      url: `${SITE_URL}/negocio/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
