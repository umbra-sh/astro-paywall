// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  adapter: vercel({}),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
