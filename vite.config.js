import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // su GitHub Pages l'app vive in /tavolo-dei-dadi/ (vedi workflow deploy.yml)
  base: process.env.BASE_PATH || '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icona-192.png', 'icona-512.png', 'icona-maskable-512.png'],
      manifest: {
        name: 'Tavolo dei Dadi',
        short_name: 'Tavolo Dadi',
        description: 'Tiratore di dadi D&D 5e con scheda del personaggio integrata',
        lang: 'it',
        display: 'standalone',
        background_color: '#1b1410',
        theme_color: '#1b1410',
        icons: [
          { src: 'icona-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icona-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icona-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // app shell offline; le chiamate /api restano solo-rete (l'import PDF
        // richiede comunque il server)
        globPatterns: ['**/*.{js,css,html,png,svg}'],
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
