import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/owner", "/api/", "/login"],
      },
    ],
    sitemap: "https://guiagastronomicacohala.dpdns.org/sitemap.xml",
  };
}
