import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  base: '/',
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "sass:color" as color;\n@use "${path.resolve('src/styles/_variables').replace(/\\/g, '/')}" as *;\n@use "${path.resolve('src/styles/_mixins').replace(/\\/g, '/')}" as *;\n`,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'LYNX – Voyez ce que les autres ne voient pas',
        short_name: 'LYNX',
        description: 'Plateforme d\'anticipation & d\'alertes en temps réel',
        theme_color: '#080C14',
        background_color: '#080C14',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: './',
        scope: './',
        categories: ['news', 'utilities', 'security'],
        icons: [
          { src: 'icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: 'icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: 'icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        shortcuts: [
          {
            name: 'Carte des alertes',
            short_name: 'Carte',
            url: './#/map',
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Score de risque',
            short_name: 'Score',
            url: './#/dashboard',
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/earthquake\.usgs\.gov/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'lynx-usgs',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 }
            }
          },
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'lynx-weather',
              expiration: { maxEntries: 20, maxAgeSeconds: 600 }
            }
          },
          {
            urlPattern: /^https:\/\/smart-cellar-api\.onrender\.com\/api\/lynx/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'lynx-strapi',
              expiration: { maxEntries: 100, maxAgeSeconds: 180 }
            }
          },
          {
            urlPattern: /^https:\/\/[abc]\.basemaps\.cartocdn\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lynx-map-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 86400 * 30 }
            }
          },
          {
            urlPattern: /^https:\/\/api\.reliefweb\.int/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'lynx-reliefweb',
              expiration: { maxEntries: 50, maxAgeSeconds: 600 }
            }
          },
          {
            urlPattern: /^https:\/\/(corsproxy\.io|api\.allorigins\.win|api\.codetabs\.com)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'lynx-cors-proxy',
              expiration: { maxEntries: 30, maxAgeSeconds: 600 }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5176
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          map: ['leaflet', 'react-leaflet'],
          motion: ['framer-motion']
        }
      }
    }
  }
});
