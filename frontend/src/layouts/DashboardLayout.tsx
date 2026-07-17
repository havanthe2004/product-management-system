import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export default function DashboardLayout({ isDark, setIsDark }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.replace(/^\//, '');
  const activeTab = (path || 'overview') as any;

  const setActiveTab = (tab: string) => {
    navigate('/' + tab);
  };

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
          <Outlet />
        </div>
      </main>
    </div>
  );
}
