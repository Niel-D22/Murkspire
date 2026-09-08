import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import { PageTransition } from './components/common/RouteTransition';
import { routeGroup, useScrollManager } from './lib/routing';
import { LoadingState } from './components/ui/LoadingState';

/* Docs and the dashboard are separate chunks. The dashboard in particular
   drags in the entire Solana wallet stack, which no landing page visitor
   should have to download. */
const Docs = lazy(() => import('./pages/Docs'));
const DashboardShell = lazy(() => import('./pages/DashboardShell'));

function AppRoutes() {
  const location = useLocation();
  useScrollManager();

  return (
    /* Keyed by route group rather than full path, so moving between dashboard
       tabs does not tear down and refetch the whole section. */
    <PageTransition transitionKey={routeGroup(location.pathname)}>
      <Suspense fallback={<LoadingState title="Loading" detail="Preparing the workspace" />}>
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/app/*" element={<DashboardShell />} />

          {/* Legacy paths */}
          <Route path="/whale-activity" element={<Navigate to="/app/whale" replace />} />
          <Route path="/market-flow" element={<Navigate to="/app/market" replace />} />
          <Route path="/staking-monitor" element={<Navigate to="/app/staking" replace />} />
          <Route path="/real-time-feed" element={<Navigate to="/app/feed" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
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
