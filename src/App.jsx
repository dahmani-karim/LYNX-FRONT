import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import Layout from './components/Layout/Layout';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Loader from './components/Loader/Loader';
import { useAlertStore } from './stores/alertStore';
import { useSettingsStore } from './stores/settingsStore';
import { useAuthStore } from './stores/authStore';

// Lazy-loaded pages (code-splitting)
const Discover = lazy(() => import('./pages/Discover/Discover'));
const Pricing = lazy(() => import('./pages/Pricing/Pricing'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const MapPage = lazy(() => import('./pages/MapPage/MapPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage/AlertsPage'));
const StatsPage = lazy(() => import('./pages/StatsPage/StatsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage/SettingsPage'));
const AlertDetail = lazy(() => import('./pages/AlertDetail/AlertDetail'));
const Account = lazy(() => import('./pages/Account/Account'));
const EnergyPrices = lazy(() => import('./pages/EnergyPrices/EnergyPrices'));
const About = lazy(() => import('./pages/About/About'));

function RequireAuth({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const fetchAllData = useAlertStore((s) => s.fetchAllData);
  const userLocation = useSettingsStore((s) => s.userLocation);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isPremium = useAuthStore((s) => s.isPremium);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  // Re-check VIP/Premium status on app load
  useEffect(() => {
    if (isAuthenticated) refreshProfile();
  }, [isAuthenticated, refreshProfile]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData(userLocation);
      const ms = isPremium ? 60 * 1000 : 5 * 60 * 1000;
      const interval = setInterval(() => fetchAllData(userLocation), ms);
      return () => clearInterval(interval);
    }
  }, [fetchAllData, userLocation, isAuthenticated, isPremium]);

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Loader text="Chargement..." />}>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* App pages (with Layout, auth required) */}
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/account" element={<Account />} />
          <Route path="/energy" element={<EnergyPrices />} />
          <Route path="/timeline" element={<Navigate to="/alerts" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/alert/:id" element={<AlertDetail />} />
        </Route>

        {/* Redirect old trackers route */}
        <Route path="/trackers" element={<Navigate to="/map" replace />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </>
  );
}
