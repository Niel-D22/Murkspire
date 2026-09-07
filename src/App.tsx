import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Docs from './pages/Docs';
import WhaleActivity from './pages/WhaleActivity';
import MarketFlow from './pages/MarketFlow';
import StakingMonitor from './pages/StakingMonitor';
import RealTimeFeed from './pages/RealTimeFeed';
import { PageTransition } from './components/RouteTransition';
import { routeGroup, useScrollManager } from './lib/routing';

/** Dashboard tabs fade on their own, without remounting the shell around them. */
function DashboardRoutes() {
  const { pathname } = useLocation();

  return (
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
  );
}

function AppRoutes() {
  const location = useLocation();
  useScrollManager();

  return (
    /* Keyed by route group rather than full path, so moving between dashboard
       tabs does not tear down and refetch the whole section. */
    <PageTransition transitionKey={routeGroup(location.pathname)}>
      <Routes location={location}>
        <Route path="/" element={<Landing />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/app/*" element={<DashboardRoutes />} />

        {/* Legacy paths */}
        <Route path="/whale-activity" element={<Navigate to="/app/whale" replace />} />
        <Route path="/market-flow" element={<Navigate to="/app/market" replace />} />
        <Route path="/staking-monitor" element={<Navigate to="/app/staking" replace />} />
        <Route path="/real-time-feed" element={<Navigate to="/app/feed" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageTransition>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
