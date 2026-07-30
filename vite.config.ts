import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'frontend',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        home: 'frontend/index.html',
        about: 'frontend/about-EA-HTS/index.html',
        programme: 'frontend/conference-programme/index.html',
      },
    },
  },
});
