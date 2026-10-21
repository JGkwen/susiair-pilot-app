// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxt/eslint'],
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Susi Air Pilot',
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
  css: ['~/assets/scss/main.scss'],
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3000',
    },
  },
  devServer: { port: 3001 },
  compatibilityDate: '2025-07-15',
  vite: {
    css: {
      preprocessorOptions: {
        scss: { additionalData: '@use "~/assets/scss/variables" as *;\n' },
      },
    },
  },
  telemetry: false,
  eslint: { config: { stylistic: true } },
})
