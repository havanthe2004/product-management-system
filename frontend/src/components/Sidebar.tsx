import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, UserRole } from '../store/slices/authSlice';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark
}: SidebarProps) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const getNavItemClass = (tab: string) => {
    return activeTab === tab ? 'sidebar-link active' : 'sidebar-link';
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <span className="brand-logo">📦</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '0.5px' }}>ProMan</span>
          <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>
            {auth.user?.role} Portal
          </span>
        </div>
      </div>

      {/* User Quick Info */}
      <div className="user-profile-summary">
        <div className="avatar-placeholder">
          {auth.user?.fullName?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <strong style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {auth.user?.fullName}
          </strong>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {auth.user?.email}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <div className={getNavItemClass('overview')} onClick={() => setActiveTab('overview')}>
          📊 Tổng quan
        </div>

        <div className={getNavItemClass('products')} onClick={() => setActiveTab('products')}>
          📦 Quản lý mặt hàng
        </div>

        <div className={getNavItemClass('commodity-groups')} onClick={() => setActiveTab('commodity-groups')}>
          📁 Quản lý nhóm mặt hàng
        </div>

        <div className={getNavItemClass('commodity-types')} onClick={() => setActiveTab('commodity-types')}>
          📁 Quản lý loại mặt hàng
        </div>

        <div className={getNavItemClass('countries')} onClick={() => setActiveTab('countries')}>
          🌍 Các nước hợp tác
        </div>

        <div className={getNavItemClass('standards')} onClick={() => setActiveTab('standards')}>
          🛡️ Quản lý tiêu chuẩn
        </div>

        <div className={getNavItemClass('units')} onClick={() => setActiveTab('units')}>
          📏 Quản lý đơn vị tính
        </div>

        {auth.user?.role === UserRole.ADMIN && (
          <>
            <div className={getNavItemClass('members')} onClick={() => setActiveTab('members')}>
              👥 Quản lý thành viên
            </div>
            <div className={getNavItemClass('audit-logs')} onClick={() => setActiveTab('audit-logs')}>
              📜 Nhật ký web
            </div>
          </>
        )}

        {/* Logout Button */}
        <button
          onClick={() => dispatch(logout())}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            marginTop: 'auto',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--danger)',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            width: '100%',
            justifyContent: 'flex-start',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-light)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          🚪 Đăng xuất
        </button>
      </nav>

      {/* Footer Sidebar (Theme toggle) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)', marginTop: '16px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {isDark ? '🌙 Chế độ tối' : '☀️ Chế độ sáng'}
        </span>
        <button
          onClick={() => setIsDark(!isDark)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
        >
          {isDark ? '💡' : '🌑'}
        </button>
      </div>
    </aside>
  );
}
