import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/app'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@entities': path.resolve(__dirname, './src/entities'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://func-pccdatasync-dev-wus-eybbg8c4eyfkc2gz.westus-01.azurewebsites.net',
        changeOrigin: true,
      },
    },
  },
});