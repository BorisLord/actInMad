// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.MODE || 'staging', process.cwd(), '');

const mode = env.MODE || 'staging';
if (!['production', 'staging'].includes(mode)) {
  throw new Error(`Invalid MODE value: ${mode}`);
}

export default defineConfig({
  site:
    mode === 'production'
      ? 'https://actinmad.art'
      : 'https://staging.actinmad.art',
  env: {
    schema: {
      MODE: envField.enum({
        context: 'server',
        access: 'public',
        values: ['production', 'staging'],
        default: 'staging',
      }),
    },
  },
  output: 'static',
  integrations: [
    tailwind(),
    icon(),
    sitemap({
      filter: (page) => mode === 'prod' || !page.includes('staging'),
      changefreq: 'monthly',
      lastmod: new Date(),
    }),
  ],
});
