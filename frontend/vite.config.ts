import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
   server: {
    allowedHosts: [
      'sb-1zluefk7c5pa.vercel.run'
    ]
  }
  plugins: [react()],
  root: '.',
  build: { outDir: 'dist' },
});
