// vite.config.js
import { resolve } from 'node:path'

export default {
  base: process.env.NODE_ENV === 'production' ? '/iconify-picker/' : '/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    copyPublicDir: true
  },
  server: {
    open: '/docs/'
  },
  publicDir: 'docs'
}
