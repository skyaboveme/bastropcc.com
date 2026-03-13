import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://bastropcc.com',
  integrations: [
    tailwind(),
    sitemap(),
    mdx(),
    icon()
  ],
  output: 'static'
});