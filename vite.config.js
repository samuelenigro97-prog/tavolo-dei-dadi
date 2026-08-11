import { defineConfig } from 'vite';
import { writeFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Identificativo univoco di questa build: viene iniettato nell'app (__BUILD_ID__)
// e scritto anche in dist/version.json. L'app confronta i due valori per capire
// se sul server c'è una versione più nuova (vedi rilevatore in App.jsx).
const BUILD_ID = Date.now().toString();

// Scrive dist/version.json a fine build. version.json NON è nella precache
// (globPatterns non include .json), quindi il fetch va sempre in rete: così il
// controllo "nuova versione disponibile" funziona anche con il service worker.
const scriveVersionJson = {
  name: 'scrive-version-json',
  apply: 'build',
  closeBundle() {
    const dir = process.env.BASE_PATH ? 'dist' : 'dist';
    try {
      writeFileSync(`${dir}/version.json`, JSON.stringify({ build: BUILD_ID }));
    } catch (e) {
      console.warn('version.json non scritto:', e?.message);
    }
  },
};

export default defineConfig({
  // su GitHub Pages l'app vive in /tavolo-dei-dadi/ (vedi workflow deploy.yml)
  base: process.env.BASE_PATH || '/',
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
  plugins: [
    react(),
    VitePWA({
      // 'autoUpdate': la nuova versione si installa e si attiva automaticamente non appena rilevata.
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icona-192.png', 'icona-512.png', 'icona-maskable-512.png'],
      manifest: {
        name: 'Tavolo dei Dadi',
        short_name: 'Tavolo dei Dadi',
        description: 'Scheda 5e interattiva: un click modifica, doppio click tira i dadi',
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
        // includo gli mp3 (loop ambientali CC0) così restano disponibili offline
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,mp3,ogg}'],
        // gli mp3 pesano più del default: alzo il limite per la precache
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/api\//],
        // quando si aggiorna, attiva subito il nuovo SW e ripulisci le cache vecchie
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // NetworkFirst: il browser scarica sempre la versione più recente;
        // cade sul cache solo se offline. Così basta premere Invio per aggiornare.
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'pages', networkTimeoutSeconds: 0 },
          },
          {
            urlPattern: /\.(?:js|css|png|jpg|svg)$/,
            handler: 'NetworkFirst',
            options: { cacheName: 'assets', networkTimeoutSeconds: 0 },
          },
          {
            // i loop audio non cambiano mai: CacheFirst (nessun ri-download)
            urlPattern: /\.(?:mp3|ogg)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'audio', expiration: { maxEntries: 30 } },
          },
        ],
      },
    }),
    scriveVersionJson,
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
