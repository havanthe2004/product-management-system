import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, UserRole } from '../store/slices/authSlice';

export const DEFAULT_AVATAR = `/image.png`;
interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab
}: SidebarProps) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const getNavItemClass = (tab: string) => {
    return activeTab === tab ? 'sidebar-link active' : 'sidebar-link';
  };

  const getAvatarUrl = (avatarPath: string | undefined) => {
    if (!avatarPath) return DEFAULT_AVATAR;
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://') || avatarPath.startsWith('data:')) {
      return avatarPath;
    }
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const hostUrl = apiBaseUrl.replace(/\/api$/, '');
    return `${hostUrl}${avatarPath}`;
  };

  const getRoleLabel = (role: string | undefined) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'MANAGER':
        return 'Quản lý';
      case 'OFFICER':
        return 'Nhân viên';
      default:
        return role || 'Thành viên';
    }
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand" style={{ marginBottom: '16px' }}>
        <span className="brand-logo">📦</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '0.5px' }}>ProMan</span>
          <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>
            {auth.user?.role} Portal
          </span>
        </div>
      </div>

      {/* User Quick Info */}
      <div
        className={`user-profile-summary ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => setActiveTab('profile')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 8px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '20px',
          cursor: 'pointer',
          borderRadius: '8px',
          transition: 'all 0.2s ease',
          backgroundColor: activeTab === 'profile' ? 'var(--primary-light)' : 'transparent'
        }}
        onMouseEnter={(e) => {
          if (activeTab !== 'profile') {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (activeTab !== 'profile') {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <img
          src={getAvatarUrl(auth.user?.avatar)}
          alt="Avatar"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: activeTab === 'profile' ? '2px solid var(--primary)' : '2px solid var(--border-color)',
            backgroundColor: 'var(--bg-main)'
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== DEFAULT_AVATAR) {
              target.src = DEFAULT_AVATAR;
            }
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <strong
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-main)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={auth.user?.fullName}
          >
            {auth.user?.fullName}
          </strong>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--primary)',
              fontWeight: '600',
              marginTop: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {getRoleLabel(auth.user?.role)}
          </span>
        </div>
      </div>

      {/* Navigation - Scrollable inside the remaining space */}
      <nav
        className="sidebar-nav"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flex: 1,
          overflowY: 'auto',
          marginRight: '-8px',
          paddingRight: '8px'
        }}
      >
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
      </nav>

      {/* Logout Button - Fixed at bottom */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)', marginTop: '16px' }}>
        <button
          onClick={() => dispatch(logout())}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
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
      </div>
    </aside>
  );
}
