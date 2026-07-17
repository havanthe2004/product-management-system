import type { CommodityGroup } from '../../types';

interface TypeFiltersProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  approvalFilter: string;
  setApprovalFilter: (v: string) => void;
  groupFilter: string;
  setGroupFilter: (v: string) => void;
  groups: CommodityGroup[];
}

export default function TypeFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  approvalFilter,
  setApprovalFilter,
  groupFilter,
  setGroupFilter,
  groups
}: TypeFiltersProps) {
  return (
    <div className="card" style={{ marginBottom: '4px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên loại, mã loại hoặc mô tả..."
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Parent Group */}
        <div style={{ width: '180px' }}>
          <select
            className="input"
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
          >
            <option value="ALL">Tất cả nhóm</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.groupName}
              </option>
            ))}
          </select>
        </div>
        
        {/* Active Status */}
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

        {/* Approval Status */}
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
