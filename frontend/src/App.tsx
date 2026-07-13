import { useState, useEffect } from 'react';
import { useAppSelector } from './store/hooks';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewTab from './components/OverviewTab';
import ProductsTab from './components/ProductsTab';
import CommodityGroupsTab from './components/CommodityGroupsTab';
import CommodityTypesTab from './components/CommodityTypesTab';
import CountriesTab from './components/CountriesTab';
import StandardsTab from './components/StandardsTab';
import UnitsTab from './components/UnitsTab';
import MembersTab from './components/MembersTab';
import AuditLogsTab from './components/AuditLogsTab';

import { UserRole } from './store/slices/authSlice';

function App() {
  const auth = useAppSelector((state) => state.auth);

  // Layout Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'commodity-groups' | 'commodity-types' | 'countries' | 'standards' | 'units' | 'members' | 'audit-logs'>('overview');

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
    return <Login />;
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
            <OverviewTab />
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <ProductsTab />
          )}

          {/* TAB 3: COMMODITY GROUPS */}
          {activeTab === 'commodity-groups' && (
            <CommodityGroupsTab />
          )}

          {/* TAB 4: COMMODITY TYPES */}
          {activeTab === 'commodity-types' && (
            <CommodityTypesTab />
          )}

          {/* TAB 5: PARTNER COUNTRIES */}
          {activeTab === 'countries' && (
            <CountriesTab />
          )}

          {/* TAB 6: QUALITY STANDARDS */}
          {activeTab === 'standards' && (
            <StandardsTab />
          )}

          {/* TAB 7: UNITS OF MEASUREMENT */}
          {activeTab === 'units' && (
            <UnitsTab />
          )}

          {/* TAB 8: MEMBERS MANAGEMENT */}
          {activeTab === 'members' && auth.user?.role === UserRole.ADMIN && (
            <MembersTab />
          )}

          {/* TAB 9: AUDIT LOGS */}
          {activeTab === 'audit-logs' && auth.user?.role === UserRole.ADMIN && (
            <AuditLogsTab />
          )}

        </div>
      </main>
    </div>
  );
}

export default App;
