import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { WalletContextProvider } from '../contexts/WalletContextProvider';
import Layout from '../components/layout/Layout';
import { PageTransition } from '../components/common/RouteTransition';
import WhaleActivity from './WhaleActivity';
import MarketFlow from './MarketFlow';
import StakingMonitor from './StakingMonitor';
import RealTimeFeed from './RealTimeFeed';

/**
 * Everything behind /app, in one lazily loaded chunk.
 *
 * WalletContextProvider used to wrap the entire application from main.tsx,
 * which meant every visitor to the landing page downloaded @solana/web3.js
 * and the whole wallet-adapter suite before the first paint, despite none of
 * it being reachable outside the dashboard. Mounting it here keeps that cost
 * on the route that actually needs it.
 */
export default function DashboardShell() {
  const { pathname } = useLocation();

  return (
    <WalletContextProvider>
      <Layout>
        <PageTransition transitionKey={pathname}>
          <Routes>
            <Route index element={<Navigate to="whale" replace />} />
            <Route path="whale" element={<WhaleActivity />} />
            <Route path="market" element={<MarketFlow />} />
            <Route path="staking" element={<StakingMonitor />} />
            <Route path="feed" element={<RealTimeFeed />} />
          </Routes>
        </PageTransition>
      </Layout>
    </WalletContextProvider>
  );
}
