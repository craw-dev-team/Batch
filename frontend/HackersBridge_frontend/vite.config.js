import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server:{
    host: '0.0.0.0',
    port : 8080,
  },
  build: {
    outDir: 'dist', // Keep the default build folder for separation
    assetsDir: 'assets',
    manifest: true, // Helps Django or Nginx serve files correctly
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});