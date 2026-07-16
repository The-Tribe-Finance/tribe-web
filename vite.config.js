import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Anchor, @solana/web3.js, and spl-token expect Node globals (Buffer, global)
// that a browser does not provide. Alias `buffer` to the npm polyfill so Vite
// bundles it instead of externalizing the Node builtin, and map `global`.
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer/',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
    esbuildOptions: {
      define: { global: 'globalThis' },
    },
  },
});
