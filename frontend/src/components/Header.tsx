
interface HeaderProps {
  activeTab: string;
}

export default function Header({ activeTab }: HeaderProps) {
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
      default:
        return 'ProMan Dashboard';
    }
  };

  return (
    <header className="header">
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>
          {getTitle()}
        </h1>
      </div>
    </header>
  );
}
