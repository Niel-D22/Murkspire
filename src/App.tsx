import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Docs from './pages/Docs';
import WhaleActivity from './pages/WhaleActivity';
import MarketFlow from './pages/MarketFlow';
import StakingMonitor from './pages/StakingMonitor';
import RealTimeFeed from './pages/RealTimeFeed';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Landing />} />
        <Route path="/docs" element={<Docs />} />

        {/* Dashboard */}
        <Route
          path="/app/*"
          element={
            <Layout>
              <Routes>
                <Route index element={<Navigate to="whale" replace />} />
                <Route path="whale" element={<WhaleActivity />} />
                <Route path="market" element={<MarketFlow />} />
                <Route path="staking" element={<StakingMonitor />} />
                <Route path="feed" element={<RealTimeFeed />} />
              </Routes>
            </Layout>
          }
        />

        {/* Legacy paths */}
        <Route path="/whale-activity"  element={<Navigate to="/app/whale"   replace />} />
        <Route path="/market-flow"     element={<Navigate to="/app/market"  replace />} />
        <Route path="/staking-monitor" element={<Navigate to="/app/staking" replace />} />
        <Route path="/real-time-feed"  element={<Navigate to="/app/feed"    replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
