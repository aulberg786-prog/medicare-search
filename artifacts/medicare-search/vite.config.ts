import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const isReplit = process.env.REPL_ID !== undefined;
const isBuild = process.env.NODE_ENV === 'production' || process.argv.includes('build');

// PORT is only required for dev server, not for production build
const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;

// BASE_PATH defaults to '/' when not set (e.g. on Vercel)
const basePath = process.env.BASE_PATH ?? '/';

const replitPlugins = [];

if (!isBuild && isReplit) {
  try {
    const { cartographer } = await import('@replit/vite-plugin-cartographer');
    replitPlugins.push(
      cartographer({ root: path.resolve(import.meta.dirname, '..') })
    );
  } catch {}

  try {
    const { devBanner } = await import('@replit/vite-plugin-dev-banner');
    replitPlugins.push(devBanner());
  } catch {}
}

const runtimeErrorPlugin = [];
try {
  runtimeErrorPlugin.push(runtimeErrorOverlay());
} catch {}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    ...runtimeErrorPlugin,
    ...replitPlugins,
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
