import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { getProfile } from './services/profile.service';
import { updateUserSuccess } from './store/slices/authSlice';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import OverviewPage from './pages/OverviewPage';
import ProductsPage from './pages/ProductsPage';
import CommodityGroupsPage from './pages/CommodityGroupsPage';
import CommodityTypesPage from './pages/CommodityTypesPage';
import CountriesPage from './pages/CountriesPage';
import StandardsPage from './pages/StandardsPage';
import UnitsPage from './pages/UnitsPage';
import MembersPage from './pages/MembersPage';
import AuditLogsPage from './pages/AuditLogsPage';
import ProfilePage from './pages/ProfilePage';

import { UserRole } from './store/slices/authSlice';

// Guard component for authenticated users
const ProtectedRoute = ({ isDark, setIsDark }: { isDark: boolean; setIsDark: (dark: boolean) => void }) => {
  const auth = useAppSelector((state) => state.auth);
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardLayout isDark={isDark} setIsDark={setIsDark} />;
};

// Guard component for guest/anonymous users (redirect if already logged in)
const AnonymousRoute = () => {
  const auth = useAppSelector((state) => state.auth);
  if (auth.isAuthenticated) {
    return <Navigate to="/overview" replace />;
  }
  return <LoginPage />;
};

function App() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  // Sync profile data on mount if authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      getProfile()
        .then((res) => {
          if (res.success && res.data) {
            dispatch(updateUserSuccess(res.data));
          }
        })
        .catch((err) => {
          console.error('Failed to sync profile:', err);
        });
    }
  }, [auth.isAuthenticated, dispatch]);

  // Theme state
  const [isDark, setIsDark] = useState(true);

  // Apply theme class to body
  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDark]);

  return (
    <Routes>
      {/* Public / Guest Routes */}
      <Route path="/login" element={<AnonymousRoute />} />

      {/* Authenticated/Protected Routes wrapped in Layout */}
      <Route element={<ProtectedRoute isDark={isDark} setIsDark={setIsDark} />}>
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/commodity-groups" element={<CommodityGroupsPage />} />
        <Route path="/commodity-types" element={<CommodityTypesPage />} />
        <Route path="/countries" element={<CountriesPage />} />
        <Route path="/standards" element={<StandardsPage />} />
        <Route path="/units" element={<UnitsPage />} />
        
        {/* Admin only routes */}
        {auth.user?.role === UserRole.ADMIN && (
          <>
            <Route path="/members" element={<MembersPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          </>
        )}

        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback redirects */}
      <Route path="/" element={<Navigate to="/overview" replace />} />
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}

export default App;
