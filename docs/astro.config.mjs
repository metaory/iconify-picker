// @ts-check
import { defineConfig, fontProviders } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://metaory.github.io',
  base: '/iconify-picker/',
  trailingSlash: 'never',
  experimental: {
    // viewTransitions: true,
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: 'Libre Barcode 128 Text',
        cssVariable: '--font-barcode',
      },
      {
        provider: fontProviders.fontsource(),
        name: 'Bungee Shade',
        cssVariable: '--font-bungee',
      },
      {
        provider: fontProviders.fontsource(),
        name: 'Nabla',
        cssVariable: '--font-nabla',
      },
      // { provider: fontProviders.fontsource(), name: 'Fredoka One', cssVariable: '--font-fredoka', },
      {
        provider: fontProviders.fontsource(),
        name: 'Monofett',
        cssVariable: '--font-monofett',
      },
      {
        provider: fontProviders.fontsource(),
        name: 'Monaspace Krypton',
        cssVariable: '--font-krypton',
        weights: [500,800]
      },
      // {
      //   provider: fontProviders.fontsource(),
      //   name: 'Staatliches',
      //   cssVariable: '--font-staatliches',
      // },
      {
        provider: fontProviders.fontsource(),
        name: 'Baloo 2',
        cssVariable: '--font-baloo2',
        weights: [100,800]
      },
      {
        provider: fontProviders.fontsource(),
        name: 'Blackout Midnight',
        cssVariable: '--font-blackout-midnight',
      },

    ],
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: false,
    },
  },
  vite: {
    resolve: {
      alias: {
        '@components': '/src/components',
        '@assets': '/src/assets',
        '@layouts': '/src/layouts',
        '@styles': '/src/styles',
      },
    },
  },
  // server: { allowedHosts: ['97ce-169-150-208-225.ngrok-free.app'], },
})
