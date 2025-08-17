import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss({
      content: ['./views/**/*.edge', './src/**/*.js'],
    }),
  ],
  build: {
    manifest: true,
    outDir: 'public/builds',
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'src/app.js'),
        style: resolve(__dirname, 'src/style.css'),
      },
      output: {
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]',
        manualChunks: {
          filepond: ['filepond', 'filepond-plugin-image-preview', 'filepond-plugin-file-validate-size', 'filepond-plugin-file-validate-type', 'filepond-plugin-image-validate-size']
        }
      },
    },
  },
  server: {
    host: 'localhost',
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
  publicDir: false,
});
