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
        name: 'Scheda Interattiva',
        short_name: 'Scheda',
        description: 'Scheda D&D 5e interattiva: un click modifica, doppio click tira i dadi',
        lang: 'it',
        display: 'standalone',
        background_color: '#f4f1ea',
        theme_color: '#f4f1ea',
        icons: [
          { src: 'icona-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icona-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icona-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg}'],
        navigateFallbackDenylist: [/^\/api\//],
        // NetworkFirst: il browser scarica sempre la versione più recente;
        // cade sul cache solo se offline. Così basta premere Invio per aggiornare.
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'pages', networkTimeoutSeconds: 0 },
          },
          {
            urlPattern: /\.(?:js|css|png|svg)$/,
            handler: 'NetworkFirst',
            options: { cacheName: 'assets', networkTimeoutSeconds: 0 },
          },
        ],
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
