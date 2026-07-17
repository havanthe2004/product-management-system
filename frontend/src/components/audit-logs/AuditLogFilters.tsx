interface AuditLogFiltersProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  moduleFilter: string;
  setModuleFilter: (v: string) => void;
  actionFilter: string;
  setActionFilter: (v: string) => void;
  emailFilter: string;
  setEmailFilter: (v: string) => void;
  emails: string[];
}

export default function AuditLogFilters({
  searchQuery,
  setSearchQuery,
  moduleFilter,
  setModuleFilter,
  actionFilter,
  setActionFilter,
  emailFilter,
  setEmailFilter,
  emails
}: AuditLogFiltersProps) {
  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo email, nội dung chi tiết hoặc hành động..."
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* User Email Filter */}
        <div style={{ width: '220px' }}>
          <select
            className="input"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
          >
            <option value="ALL">Tất cả người dùng</option>
            {emails.map((email) => (
              <option key={email} value={email}>
                {email}
              </option>
            ))}
          </select>
        </div>

        {/* Module Filter */}
        <div style={{ width: '200px' }}>
          <select
            className="input"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
          >
            <option value="ALL">Tất cả nghiệp vụ</option>
            <option value="MẶT HÀNG">Mặt hàng</option>
            <option value="DANH MỤC NHÓM MẶT HÀNG">Danh mục Nhóm mặt hàng</option>
            <option value="DANH MỤC LOẠI MẶT HÀNG">Danh mục Loại mặt hàng</option>
            <option value="CÁC NƯỚC HỢP TÁC">Các nước hợp tác</option>
            <option value="QUẢN LÝ TIÊU CHUẨN CHẤT LƯỢNG">Tiêu chuẩn chất lượng</option>
            <option value="ĐƠN VỊ TÍNH">Đơn vị tính</option>
            <option value="QUẢN LÝ THÀNH VIÊN">Quản lý thành viên</option>
            <option value="HỆ THỐNG">Tài khoản & Hệ thống</option>
          </select>
        </div>

        {/* Action Filter */}
        <div style={{ width: '180px' }}>
          <select
            className="input"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="ALL">Tất cả hành động</option>
            <option value="ĐĂNG NHẬP">Đăng nhập</option>
            <option value="ĐĂNG KÝ">Đăng ký</option>
            <option value="THÊM MỚI">Thêm mới</option>
            <option value="CẬP NHẬT">Cập nhật</option>
            <option value="XÓA">Xóa</option>
            <option value="KHÔI PHỤC">Khôi phục</option>
            <option value="DUYỆT">Duyệt</option>
            <option value="TỪ CHỐI">Từ chối duyệt</option>
          </select>
        </div>
      </div>
    </div>
  );
}
