import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: __dirname, // Stellt sicher, dass Vite im Projekt-Root bleibt
  plugins: [react()],
  resolve: {
    // Verhindert, dass Vite außerhalb des Projektordners sucht
    preserveSymlinks: true,
    alias: {
      '@': path.resolve(__dirname, 'src'), // Falls du Aliase verwendest
    },
  },
  server: {
    fs: {
      // Beschränke den Dateizugriff auf den Projektordner
      strict: true,
      allow: [path.resolve(__dirname)],
    },
  },
});