import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Price requests go through the dev server so an optional JUP_API_KEY stays out
// of the browser bundle. Jupiter also allows a limited keyless rate for local use.
function jupiterPriceProxy() {
  return {
    name: 'jupiter-price-proxy',
    configureServer(server) {
      server.middlewares.use('/api/jupiter/prices', async (req, res) => {
        const ids = new URL(req.url, 'http://localhost').searchParams
          .get('ids')
          ?.split(',')
          .filter((id) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(id))
          .slice(0, 50) || [];
        if (!ids.length) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'A valid token mint is required' }));
          return;
        }
        try {
          const apiKey = process.env.JUP_API_KEY;
          const response = await fetch(`https://api.jup.ag/price/v3?ids=${encodeURIComponent(ids.join(','))}`, {
            headers: apiKey ? { 'x-api-key': apiKey } : {},
          });
          const body = await response.text();
          res.writeHead(response.status, { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=10' });
          res.end(body);
        } catch {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Jupiter price API is unavailable' }));
        }
      });
    },
  };
}

// Anchor, @solana/web3.js, and spl-token expect Node globals (Buffer, global)
// that a browser does not provide. Alias `buffer` to the npm polyfill so Vite
// bundles it instead of externalizing the Node builtin, and map `global`.
export default defineConfig({
  plugins: [react(), jupiterPriceProxy()],
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
