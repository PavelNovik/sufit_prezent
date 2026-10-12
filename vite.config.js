import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Адрес презентации для canonical и Schema.org: SITE_URL → домен Vercel → brand.siteUrl (src/config.js)
const siteUrl =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  ''

export default defineConfig({
  plugins: [react()],
  server: { port: 5190 },
  preview: { port: 4190 },
  define: {
    __SITE_URL__: JSON.stringify(siteUrl),
  },
})
