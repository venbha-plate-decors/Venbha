import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/Venbha/',
  plugins: [react()],
  server: {
    host: true, // Enable network access
    port: 5173, // Default port
    strictPort: false, // Use another port if 5173 is busy
  },
  build: {
    // Minify output
    minify: 'esbuild', // standard speedy minifier
    cssMinify: true,
    rollupOptions: {
      output: {
        // Manual chunks for code splitting
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
          ui: ['@radix-ui/react-icons'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
