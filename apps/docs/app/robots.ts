import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Iframe-only block previews and the search endpoint.
        disallow: ["/preview/", "/api/"],
      },
    ],
    sitemap: "https://keystoneui.io/sitemap.xml",
  };
}
