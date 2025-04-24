// vite.config.js
import { resolve } from 'node:path'

export default {
  root: 'docs',
  base: '/iconify-picker/',
  appType: 'mpa', // Enable multi-page application mode
  resolve: {
    alias: {
      './iconify-picker.js': resolve(__dirname, 'lib/iconify-picker.js')
    }
  },
  server: {
    fs: {
      allow: [
        resolve(__dirname, 'lib'),
        resolve(__dirname, 'docs'),
      ]
    }
  }
}
