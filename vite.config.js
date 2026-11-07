import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Meu Fichário Pokémon',
        short_name: 'Fichário',
        description: 'Organize sua coleção de cartas Pokémon.',
        theme_color: '#101014',
        background_color: '#101014',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
  { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
]
      }
    })
  ]
})