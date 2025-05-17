import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    allowedHosts: ['campusconnect.tkbox.cfd'],
    proxy: {
      '/api': {
        target: 'http://192.168.1.64:5000',
        changeOrigin: true,
      }
    },
  },  
})
