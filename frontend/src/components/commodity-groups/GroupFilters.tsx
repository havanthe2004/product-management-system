interface GroupFiltersProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  approvalFilter: string;
  setApprovalFilter: (v: string) => void;
}

export default function GroupFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  approvalFilter,
  setApprovalFilter
}: GroupFiltersProps) {
  return (
    <div className="card" style={{ marginBottom: '4px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên nhóm, mã nhóm hoặc mô tả..."
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div style={{ width: '180px' }}>
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Ngừng hoạt động</option>
          </select>
        </div>

        <div style={{ width: '180px' }}>
          <select
            className="input"
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
          >
            <option value="ALL">Tất cả duyệt</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
      </div>
    </div>
  );
}
