import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // In dev, proxy /api and /auth to the backend to avoid CORS cookie issues
    proxy: {
      '/auth':         { target: 'http://localhost:4000', changeOrigin: true },
      '/firms':        { target: 'http://localhost:4000', changeOrigin: true },
      '/api':          { target: 'http://localhost:4000', changeOrigin: true },
      '/notifications':{ target: 'http://localhost:4000', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
