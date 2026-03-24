import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'next.maxify.ai',
      'devnext.maxify.ai'
    ],
    host: true,
    port: 8080
  }
})
