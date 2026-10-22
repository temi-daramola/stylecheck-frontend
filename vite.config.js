import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UI_PACKAGES = /node_modules\/(@chakra-ui|@emotion|@ark-ui|@zag-js|@floating-ui|framer-motion)/;
const REACT_PACKAGES = /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // The session state (application/) and the auth module import each other by design
          // (the module supplies the pure request functions, application holds the shared state),
          // so they must end up in the same chunk.
          if (id.includes('/src/application/') || id.includes('/src/modules/auth/')) return 'session';
          if (UI_PACKAGES.test(id)) return 'ui';
          if (REACT_PACKAGES.test(id)) return 'react';
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
