import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Default: root (Vercel). Set VITE_BASE=/DistanciaCero/ for GitHub Pages.
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Distancia Cero',
        short_name: 'Distancia Cero',
        description: 'Un universo digital para dos',
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