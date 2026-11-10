import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // loadEnv để đọc VITE_API_TARGET từ .env.development / .env.production.
  // process.env không tự chứa biến trong file .env nên phải load thủ công.
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:9007';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: apiTarget,
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
          // Split heavy vendor libraries into their own chunks so we don't
          // ship a single large bundle.
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-helmet':
              ['react-helmet-async', 'react-i18next', 'i18next', 'i18next-browser-languagedetector'],
            'vendor-motion': ['framer-motion'],
            'vendor-icons': ['react-icons'],
          },
          // Predictable chunk file names so CDN cache-busting and debugging
          // stay straightforward.
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
  };
});
