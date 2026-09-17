import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:9007',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: process.env.VITE_API_TARGET || 'http://localhost:9007',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Increase the chunk-size warning so we only see warnings for chunks that
    // are large in absolute terms (split chunks fall under ~200kB after our
    // route-level lazy() work).
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split heavy vendor libraries into their own chunks so they can be
        // cached independently of our application code. This is the single
        // biggest lever we have for repeat-visit performance.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-helmet':
            ['react-helmet-async', 'react-i18next', 'i18next', 'i18next-browser-languagedetector'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['react-icons'],
        },
        // Predictable chunk file names make CDN cache-busting & debugging
        // straightforward.
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
