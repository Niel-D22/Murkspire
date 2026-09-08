# Murkspire

*A spire above the murk.*

Real-time Solana intelligence: whale movements, market flow, validator staking
and a merged live event feed. Read-only, non-custodial, no account required.

---

## Requirements

- Node.js 18+
- A Helius API key — https://dashboard.helius.dev/

## Setup

```bash
npm install
cp .env.example .env.local     # then paste your key into it
npm run dev
```

The app runs at http://localhost:5173

### The API key

`HELIUS_API_KEY` deliberately has **no `VITE_` prefix**. Vite inlines anything
with that prefix into the client bundle, where any visitor can read it. This
key is used only on the server:

- **Locally** — a middleware in `vite.config.ts` serves `/api/helius`
- **In production** — `api/helius.ts`, a Vercel edge function

Set the same variable in your hosting provider's environment before deploying.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server, with the Helius proxy attached |
| `npm run build` | Type-check then production build |
| `npm test` | Unit tests (vitest) |
| `npm run typecheck` | Types only |
| `npm run lint` | ESLint |

## Structure

```
api/                    Serverless functions (Vercel edge)
  helius.ts             Proxies Helius; holds the key, allowlists RPC methods

src/
  components/
    common/             ErrorBoundary, RouteTransition, WalletButton
    brand/              Logo and wordmark
    landing/            Public site sections
    layout/             Dashboard shell
    ui/                 Buttons, modal, loading and error states
    vendor/             Third-party components (React Bits), lightly patched
  hooks/                useScrollProgress, useLiveTicker
  lib/
    helius.ts           All chain reads and response parsing
    solana-price.ts     Live SOL price and supply, with fallbacks
    routing.ts          Scroll restoration and route grouping
  pages/
    Landing.tsx         Public site
    Docs.tsx            Documentation
    DashboardShell.tsx  Everything behind /app, lazily loaded
    WhaleActivity.tsx   MarketFlow.tsx  StakingMonitor.tsx  RealTimeFeed.tsx
```

## Routes

| Path | Page |
| --- | --- |
| `/` | Landing |
| `/docs` | Documentation |
| `/app/whale` | Whale activity |
| `/app/market` | Market flow |
| `/app/staking` | Staking monitor |
| `/app/feed` | Live feed |

## Data sources

| Source | Used for | Key required |
| --- | --- | --- |
| Helius Enhanced Transactions | Whale activity | yes, server-side |
| Helius RPC | Validators, epoch, inflation | yes, server-side |
| DexScreener | DEX volume, liquidity, price | no |
| Jupiter | Live SOL price | no |
| CoinGecko | Price fallback, total supply | no |

Nothing is cached on a server Murkspire controls, and no analytics service
sits in between.

## Licence

See [LICENSE](LICENSE).
