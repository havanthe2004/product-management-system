interface HeaderProps {
  activeTab: string;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export default function Header({ activeTab, isDark, setIsDark }: HeaderProps) {
  const getTitle = () => {
    switch (activeTab) {
      case 'overview':
        return '📊 Bảng Điều Khiển Tổng Quan';
      case 'products':
        return '📦 Quản lý mặt hàng';
      case 'commodity-groups':
        return '📁 Danh mục nhóm mặt hàng';
      case 'commodity-types':
        return '📁 Danh mục loại mặt hàng';
      case 'countries':
        return '🌍 Quản lý quốc gia đối tác';
      case 'standards':
        return '🛡️ Quản lý tiêu chuẩn kỹ thuật';
      case 'units':
        return '📏 Quản lý đơn vị đo lường';
      case 'members':
        return '👥 Quản lý thành viên hệ thống';
      case 'audit-logs':
        return '📜 Nhật ký hoạt động hệ thống';
      case 'profile':
        return '👤 Thông tin cá nhân & Bảo mật';
      default:
        return 'ProMan Dashboard';
    }
  };

  return (
    <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>
          {getTitle()}
        </h1>
      </div>

      {/* Ghim nút đổi chế độ sáng/tối cố định ở góc trên bên phải màn hình */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          backgroundColor: 'var(--bg-main)',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
          {isDark ? '🌙 Chế độ tối' : '☀️ Chế độ sáng'}
        </span>
        <button
          onClick={() => setIsDark(!isDark)}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isDark ? '💡' : '🌑'}
        </button>
      </div>
    </header>
  );
}
