import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'tominand.pp.ua',
      'www.tominand.pp.ua'
    ],
    host: true,
    port: 8080
  }
})