# AgentSpy

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/typescript-%230074c1.svg?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Solana](https://img.shields.io/badge/Solana-9945FF?logo=solana&logoColor=white)

**AgentSpy** is an advanced Solana blockchain monitoring platform with real-time capabilities to track whale activity, market flow, staking data, and real-time feeds. Designed to provide deep insights into the Solana ecosystem.

## Key Features

### Whale Activity Tracker
- Monitor large transactions from Solana whale wallets
- Track up to 5 major whale addresses
- Filter by transaction amount and time
- Export data to CSV/JSON
- Real-time signature tracking

### Market Flow Analyzer
- DEX analysis (Jupiter, Raydium, Orca)
- Real-time trading volume tracking
- Price action monitoring via CoinGecko API
- Flow visualization for token pairs
- Swap analytics with advanced filters

### Staking Monitor
- Monitor 849+ Solana validators
- Real-time APY data for all validators
- Staking statistics and performance metrics
- Validator leaderboard based on performance
- Export staking data for analysis

### Real-time Feed
- Live event streaming from Solana blockchain
- Real-time transaction updates
- WebSocket connection for latest data
- Auto-refresh every 5 seconds
- Event aggregation from multiple sources

### Wallet Integration
- Multi-wallet support (Phantom, Solflare, Coinbase, Trust Wallet, Ledger)
- Seamless wallet connection
- Transaction history integration
- Balance tracking and wallet management

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Solana Wallet Adapters** - Multi-wallet integration

### Backend
- **Supabase Edge Functions** - Serverless backend (Deno runtime)
- **PostgreSQL** - Primary database
- **Real-time Subscriptions** - Live data streaming

### Blockchain Integration
- **Solana RPC** - Mainnet blockchain interaction
- **Jupiter API** - DEX aggregation and swap data
- **CoinGecko API** - Real-time token prices

## 📁 Project Structure
```
AgentSpy/
├── src/                          # Frontend source code
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Base UI components
│   │   │   ├── Modal.tsx        # Modal system
│   │   │   ├── SearchBar.tsx    # Search interface
│   │   │   ├── ExportButton.tsx # Data export
│   │   │   └── CopyButton.tsx   # Copy functionality
│   │   ├── WalletButton.tsx     # Multi-wallet connection
│   │   └── layout/              # Layout components
│   ├── pages/                   # Main application pages
│   │   ├── WhaleActivity.tsx    # Whale tracking
│   │   ├── MarketFlow.tsx       # DEX analysis
│   │   ├── StakingMonitor.tsx   # Validator monitoring
│   │   └── RealTimeFeed.tsx     # Live event feed
│   ├── contexts/                # React contexts
│   │   └── WalletContextProvider.tsx
│   ├── hooks/                   # Custom React hooks
│   └── lib/                     # Utility libraries
│       └── supabase.ts          # Supabase client
├── supabase/                    # Backend configuration
│   ├── functions/               # Edge Functions
│   │   ├── fetch-whale-transactions/
│   │   ├── fetch-market-flow/
│   │   ├── fetch-staking-data/
│   │   ├── aggregate-real-time-feed/
│   │   └── cron-refresh-data/
│   ├── tables/                  # Database schemas
│   ├── migrations/              # Database migrations
│   └── cron_jobs/               # Scheduled tasks
├── docs/                        # Documentation
└── .github/                     # GitHub templates
```

## Installation & Running

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account and project
- Git

### 1. Clone Repository
```bash
git clone https://github.com/superbixnggas/AgentSpy.git
cd AgentSpy
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Setup Supabase Backend
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy
```

### 5. Run Development Server
```bash
# Frontend development
npm run dev

# Backend functions (in another terminal)
supabase functions serve
```

The application will run at `http://localhost:5173`

### 6. Build for Production
```bash
npm run build
npm run preview
```

## Documentation

- [Architecture Overview](docs/architecture.md)
- [API Documentation - Market Flow](docs/api-market-flow.md)
- [API Documentation - Whale Transactions](docs/api-whale-transactions.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [Roadmap](ROADMAP.md)

## Contributing

We welcome contributions from the community! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the [MIT License](LICENSE).

## Security

To report security vulnerabilities, see [SECURITY.md](SECURITY.md).

---

**AgentSpy** - *Your intelligent Solana blockchain monitoring companion* 🚀
