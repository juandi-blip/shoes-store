import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages sirve este repo bajo /shoes-store/ (project page), no en la
// raíz del dominio. Vite necesita saberlo para resolver rutas de assets
// (JS/CSS/imágenes) correctamente en producción. En dev (`pnpm dev`) sigue
// siendo "/" para no romper el servidor local.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/shoes-store/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
  },
}))
