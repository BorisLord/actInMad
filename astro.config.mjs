// @ts-check
import { defineConfig, envField } from "astro/config";
import { loadEnv } from "vite";

import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import astroLLMsGenerator from "astro-llms-generate";

import preact from "@astrojs/preact";

const env = loadEnv(process.env.MODE || "staging", process.cwd(), "");

const mode = env.MODE || "staging";
if (!["production", "staging"].includes(mode)) {
  throw new Error(`Invalid MODE value: ${mode}`);
}

export default defineConfig({
  experimental: {
    fonts: [
      {
        name: "Arbutus Slab",
        provider: "local",
        cssVariable: "--font-madTitleFont",
        variants: [
          {
            src: ["./src/fonts/arbutus-slab-v16-latin-regular.woff2"],
            weight: 400,
            style: "normal",
          },
        ],
        fallbacks: ["serif"],
      },
      {
        name: "Inter",
        provider: "local",
        cssVariable: "--font-madBodyFont",
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/fonts/inter-v19-latin-regular.woff2"],
          },
          {
            weight: 700,
            style: "normal",
            src: ["./src/fonts/inter-v19-latin-700.woff2"],
          },
        ],
        fallbacks: ["sans-serif"],
      },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  site:
    mode === "production"
      ? "https://actinmad.art"
      : "https://staging.actinmad.art",
  env: {
    schema: {
      PUBLIC_PB_URL: envField.string({ context: "client", access: "public" }),
      PB_BUILDER_EMAIL: envField.string({
        context: "server",
        access: "secret",
      }),
      PB_BUILDER_PASSWORD: envField.string({
        context: "server",
        access: "secret",
      }),
      MODE: envField.enum({
        context: "server",
        access: "secret",
        values: ["production", "staging"],
        default: "staging",
      }),
    },
  },
  // output: 'server',
  integrations: [
    mode === "production" ? astroLLMsGenerator() : [],
    icon(),
    sitemap({
      filter: (page) => mode === "prod" || !page.includes("staging"),
      changefreq: "monthly",
      lastmod: new Date(),
    }),
    preact({ compat: true }),
  ],
});
