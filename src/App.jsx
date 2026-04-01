import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import Layout from './components/Layout/Layout';
import Landing from './pages/Landing/Landing';
import Discover from './pages/Discover/Discover';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Pricing from './pages/Pricing/Pricing';
import Dashboard from './pages/Dashboard/Dashboard';
import MapPage from './pages/MapPage/MapPage';
import AlertsPage from './pages/AlertsPage/AlertsPage';
import StatsPage from './pages/StatsPage/StatsPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import AlertDetail from './pages/AlertDetail/AlertDetail';
import Account from './pages/Account/Account';
import { useAlertStore } from './stores/alertStore';
import { useSettingsStore } from './stores/settingsStore';
import { useAuthStore } from './stores/authStore';

export default function App() {
  const fetchAllData = useAlertStore((s) => s.fetchAllData);
  const userLocation = useSettingsStore((s) => s.userLocation);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData(userLocation);
      const interval = setInterval(() => fetchAllData(userLocation), 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchAllData, userLocation, isAuthenticated]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* App pages (with Layout) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/account" element={<Account />} />
          <Route path="/alert/:id" element={<AlertDetail />} />
        </Route>
      </Routes>
    </>
  );
}
