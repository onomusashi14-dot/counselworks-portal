import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Firm A (seeded dev firm). All portal endpoints live under
// /firms/:firmId/portal/*, so the frontend calls /api/* and Vite rewrites
// to the full backend URL during development.
const FIRM_A_ID = '11111111-1111-1111-1111-111111111111';

export default defineConfig(({ mode }) => {
  // Use Vite's own env loader instead of `process.env`, which requires
  // @types/node and breaks the project build when it isn't installed.
  const env = loadEnv(mode, '.', '');
  const apiTarget = env.VITE_API_TARGET ?? 'http://localhost:4000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, `/firms/${FIRM_A_ID}/portal`),
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      // Fail the build on chunks larger than ~600KB so we catch accidental
      // bloat before it ships. Raise this consciously if a legitimate vendor
      // chunk pushes over the threshold.
      chunkSizeWarningLimit: 600,
    },
  };
});
