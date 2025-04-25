import type { APIRoute } from "astro";

const envMode = import.meta.env.MODE || "staging";

const getRobotsTxt = (sitemapURL: URL, isStaging: boolean) => `
User-agent: *
${isStaging ? "Disallow: /" : "Allow: /"}
Disallow: /cdn-cgi/
${isStaging ? "" : `Sitemap: ${sitemapURL.href}`}
`;

export const GET: APIRoute = ({ site }) => {
  const isStaging = envMode === "staging";

  const sitemapURL = new URL("sitemap-index.xml", site);
  const robotsTxt = getRobotsTxt(sitemapURL, isStaging);

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
