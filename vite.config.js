import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Vercel deploys at root (/), GitHub Pages at /DistanciaCero/
const base = process.env.VITE_BASE || '/DistanciaCero/'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Distancia Cero — Ale & Yori',
        short_name: 'Distancia Cero',
        description: 'Un universo digital para Ale & Yori',
        theme_color: '#050008',
        background_color: '#050008',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: base,
        scope: base,
        icons: [
          {
            src: `${base}favicon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base,
})