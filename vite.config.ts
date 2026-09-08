import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import sourceIdentifierPlugin from 'vite-plugin-source-identifier';

const isProd = process.env.BUILD_MODE === 'prod';

/**
 * Serves /api/helius during `npm run dev`.
 *
 * In production that path is a Vercel edge function (api/helius.ts). The dev
 * server does not run those, so without this the dashboard would only work
 * under `vercel dev`. The key is read here, on the Node side — it is never
 * handed to the browser.
 */
function heliusDevProxy(key: string): Plugin {
  const ALLOWED = new Set([
    'getSignaturesForAddress',
    'getTransaction',
    'getVoteAccounts',
    'getEpochInfo',
    'getInflationRate',
    'getSlot',
    'getBalance',
    'getTokenSupply',
    'getAsset',
  ]);

  return {
    name: 'helius-dev-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/helius', async (req, res) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify(body));
        };

        if (!key) return send(500, { error: 'HELIUS_API_KEY is not set in .env.local' });

        try {
          if (req.method === 'GET') {
            const url = new URL(req.url ?? '', 'http://localhost');
            const address = url.searchParams.get('address') ?? '';
            const limit = Math.min(Number(url.searchParams.get('limit') ?? 12) || 12, 100);
            if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
              return send(400, { error: 'address must be a base58 Solana address' });
            }
            const upstream = await fetch(
              `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${key}&limit=${limit}`
            );
            return send(upstream.ok ? 200 : 502, await upstream.json());
          }

          if (req.method === 'POST') {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(chunk as Buffer);
            const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');

            if (!ALLOWED.has(body?.method)) {
              return send(403, { error: `method not allowed: ${body?.method ?? '(missing)'}` });
            }

            const upstream = await fetch(`https://mainnet.helius-rpc.com/?api-key=${key}`, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: body.id ?? '1',
                method: body.method,
                params: body.params ?? [],
              }),
            });
            return send(upstream.ok ? 200 : 502, await upstream.json());
          }

          send(405, { error: 'method not allowed' });
        } catch (error) {
          send(500, { error: error instanceof Error ? error.message : 'proxy failed' });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Prefix '' so non-VITE_ variables are visible to the config, but never to
  // the client bundle.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      heliusDevProxy(env.HELIUS_API_KEY ?? ''),
      sourceIdentifierPlugin({
        enabled: !isProd,
        attributePrefix: 'data-matrix',
        includeProps: true,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        buffer: 'buffer',
        process: 'process',
      },
    },
    build: {
      target: 'esnext',
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          /* Split the heavy third-party groups apart so a change to app code
             does not invalidate all of them, and so the landing page only
             downloads what it actually renders. */
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('@solana') || id.includes('@reown') || id.includes('@walletconnect'))
              return 'solana';
            if (id.includes('recharts') || id.includes('d3-')) return 'charts';
            if (id.includes('three')) return 'three';
            if (id.includes('gsap')) return 'gsap';
            if (id.includes('ogl')) return 'ogl';
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/'))
              return 'react-vendor';
            if (id.includes('@radix-ui')) return 'radix';
          },
        },
        onwarn(warning, warn) {
          // Suppress warnings about external modules
          if (warning.code === 'UNRESOLVED_IMPORT') return;
          warn(warning);
        },
      },
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    optimizeDeps: {
      include: [
        '@solana/web3.js',
        '@solana/wallet-adapter-base',
        '@solana/wallet-adapter-react',
        '@solana/wallet-adapter-react-ui',
        '@solana/wallet-adapter-wallets',
        'buffer',
      ],
      esbuildOptions: {
        target: 'esnext',
        supported: { bigint: true },
      },
    },
    define: {
      'process.env': {},
      global: 'globalThis',
    },
  };
});
