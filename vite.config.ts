import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          deck: ['@deck.gl/core', '@deck.gl/layers', '@deck.gl/react'],
          map: ['maplibre-gl', 'react-map-gl/maplibre'],
          radix: ['@radix-ui/themes'],
          tanstack: ['@tanstack/react-query', '@tanstack/react-router'],
        },
      },
    },
  },
})
