import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { getProfile } from './services/profile.service';
import { updateUserSuccess } from './store/slices/authSlice';
import LoginPage from './pages/LoginPage';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
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

  // Layout Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'commodity-groups' | 'commodity-types' | 'countries' | 'standards' | 'units' | 'members' | 'audit-logs' | 'profile'>('overview');

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

  if (!auth.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Header Component */}
        <Header activeTab={activeTab} isDark={isDark} setIsDark={setIsDark} />

        {/* Content Body */}
        <div className="content-body" style={{ overflowY: 'auto' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <OverviewPage />
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <ProductsPage />
          )}

          {/* TAB 3: COMMODITY GROUPS */}
          {activeTab === 'commodity-groups' && (
            <CommodityGroupsPage />
          )}

          {/* TAB 4: COMMODITY TYPES */}
          {activeTab === 'commodity-types' && (
            <CommodityTypesPage />
          )}

          {/* TAB 5: PARTNER COUNTRIES */}
          {activeTab === 'countries' && (
            <CountriesPage />
          )}

          {/* TAB 6: QUALITY STANDARDS */}
          {activeTab === 'standards' && (
            <StandardsPage />
          )}

          {/* TAB 7: UNITS OF MEASUREMENT */}
          {activeTab === 'units' && (
            <UnitsPage />
          )}

          {/* TAB 8: MEMBERS MANAGEMENT */}
          {activeTab === 'members' && auth.user?.role === UserRole.ADMIN && (
            <MembersPage />
          )}

          {/* TAB 9: AUDIT LOGS */}
          {activeTab === 'audit-logs' && auth.user?.role === UserRole.ADMIN && (
            <AuditLogsPage />
          )}

          {/* TAB 10: USER PROFILE */}
          {activeTab === 'profile' && (
            <ProfilePage />
          )}

        </div>
      </main>
    </div>
  );
}

export default App;
