import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      // Forward /api/* to the production HTTPS backend (or local override)
      '/api': {
        target: 'https://api.exofo.exofttechnologies.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
