import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Gera o SW automaticamente com Workbox
      registerType: 'autoUpdate',
      // Inclui o SW na build de produção e no preview
      devOptions: {
        enabled: true, // habilita SW em dev para testar
        type: 'module',
      },
      // Arquivos a serem pre-cacheados (App Shell)
      includeAssets: [
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'icon-192x192.png',
        'icon-512x512.png',
      ],
      // Web App Manifest — o "contrato" que o Android usa para instalar
      manifest: {
        name: 'Din — Gestão Financeira Inteligente',
        short_name: 'Din',
        description: 'Controle financeiro pessoal com IA via WhatsApp e Telegram',
        theme_color: '#080d1a',
        background_color: '#080d1a',
        display: 'standalone',      // abre sem barra de endereço (parece app nativo)
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'pt-BR',
        categories: ['finance', 'productivity'],
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable', // ícone adaptável para Android launchers
          },
        ],
        // Atalhos de início rápido (aparecem no menu de toque longo no Android)
        shortcuts: [
          {
            name: 'Nova Transação',
            short_name: 'Transação',
            description: 'Registrar um gasto ou receita',
            url: '/transactions',
            icons: [{ src: 'icon-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Contas a Pagar',
            short_name: 'Contas',
            description: 'Ver vencimentos e boletos',
            url: '/bills',
            icons: [{ src: 'icon-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Dashboard',
            short_name: 'Painel',
            description: 'Ver resumo financeiro',
            url: '/',
            icons: [{ src: 'icon-192x192.png', sizes: '192x192' }],
          },
        ],
        // Protocolo de compartilhamento — usuário pode compartilhar texto para o Din registrar
        share_target: {
          action: '/simulator',
          method: 'GET',
          params: {
            text: 'message',
          },
        },
      },
      // Configuração Workbox (estratégias de cache)
      workbox: {
        // Pre-cache: app shell (HTML, JS, CSS, ícones)
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff2}'],
        // Runtime cache: estratégias por rota
        // Runtime cache: estratégias por rota (apenas fontes e estáticos, NUNCA rotas da API)
        runtimeCaching: [
          // ── Google Fonts (CacheFirst — raramente muda) ────────────────────
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  envDir: '../',
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    emptyOutDir: false,
  },
});


