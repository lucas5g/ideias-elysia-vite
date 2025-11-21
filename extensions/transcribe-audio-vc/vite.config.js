import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        contentScript: resolve(__dirname, 'src/contentScript.js'),
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife',
        name: 'ChatwootTranscriber'
      }
    },
    minify: false, // Facilita debug
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
