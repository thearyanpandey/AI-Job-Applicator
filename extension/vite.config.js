import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {crx} from '@crxjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import manifest from './manifest.json'
import {resolve} from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    crx({manifest})
  ],
  build: {
    rollupOptions: {
      input: {
        main : resolve(__dirname, 'index.html'),  //The popup
        options: resolve(__dirname, 'option.html') //the dashboard
      }
    }
  }
})