import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves this project from /3d_Portfolio/.
// Set VITE_BASE=/ when deploying to a root domain instead.
const base = process.env.VITE_BASE || '/3d_Portfolio/';

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    // The room renders with three's WebGPU build (which carries its own WebGL 2 fallback).
    // Pointing every 'three' import at that build keeps the classic WebGL renderer out of the bundle.
    alias: [{ find: /^three$/, replacement: 'three/webgpu' }],
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
