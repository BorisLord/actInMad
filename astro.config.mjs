// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import { loadEnv } from "vite";

const env = loadEnv(process.env.MODE || "staging", process.cwd(), "");

const mode = env.MODE || "staging";
if (!["production", "staging"].includes(mode)) {
  throw new Error(`Invalid MODE value: ${mode}`);
}

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site:
    mode === "production"
      ? "https://actinmad.art"
      : "https://staging.actinmad.art",
  env: {
    schema: {
      API_URL: envField.string({ context: "client", access: "public" }),
      MODE: envField.enum({
        context: "server",
        access: "public",
        values: ["production", "staging"],
        default: "staging",
      }),
    },
  },
  // output: 'server',
  integrations: [
    icon(),
    sitemap({
      filter: (page) => mode === "prod" || !page.includes("staging"),
      changefreq: "monthly",
      lastmod: new Date(),
    }),
  ],
});
