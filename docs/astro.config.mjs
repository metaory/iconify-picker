// @ts-check
import { defineConfig, fontProviders } from 'astro/config'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://metaory.github.io',
  base: '/iconify-picker/',
  trailingSlash: 'never',
  fonts: [
    ['Libre Barcode 128 Text', '--font-barcode', [['barcode.woff2', 400]]],
    ['Bungee Shade', '--font-bungee', [['bungee.woff2', 400]]],
    ['Monaspace Krypton', '--font-krypton', [['krypton5.woff2', 500], ['krypton8.woff2', 800]]],
    ['Blackout Midnight', '--font-blackout-midnight', [['blackout.woff2', 400]]],
  ].map(([name, cssVariable, files]) => ({
    provider: fontProviders.local(),
    name,
    cssVariable,
    options: {
      variants: files.map(([file, weight]) => ({
        src: [`./src/assets/fonts/${file}`],
        weight,
        style: 'normal',
      })),
    },
  })),
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
        '@root': path.resolve(__dirname, '..'),
      },
    },
  },
  // server: { allowedHosts: ['97ce-169-150-208-225.ngrok-free.app'], },
})
