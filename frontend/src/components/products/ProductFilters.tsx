import type { CommodityGroup, CommodityType } from '../../types';

interface ProductFiltersProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  groupFilter: string;
  setGroupFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  activeFilter: string;
  setActiveFilter: (v: string) => void;
  approvalFilter: string;
  setApprovalFilter: (v: string) => void;
  categories: CommodityGroup[];
  types: CommodityType[];
}

export default function ProductFilters({
  searchQuery,
  setSearchQuery,
  groupFilter,
  setGroupFilter,
  typeFilter,
  setTypeFilter,
  activeFilter,
  setActiveFilter,
  approvalFilter,
  setApprovalFilter,
  categories,
  types,
}: ProductFiltersProps) {
  return (
    <div className="card" style={{ marginBottom: '4px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên, mã sản phẩm hoặc mô tả..."
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div style={{ width: '160px' }}>
          <select
            className="input"
            value={groupFilter}
            onChange={(e) => {
              setGroupFilter(e.target.value);
              setTypeFilter('ALL'); // Reset type filter on group filter change
            }}
          >
            <option value="ALL">Tất cả nhóm</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.groupName}</option>
            ))}
          </select>
        </div>

        <div style={{ width: '160px' }}>
          <select
            className="input"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            disabled={groupFilter === 'ALL'}
          >
            <option value="ALL">Tất cả loại</option>
            {types
              .filter((t) => groupFilter === 'ALL' || Number(t.groupId || t.group?.id) === Number(groupFilter))
              .map((t) => (
                <option key={t.id} value={t.id}>{t.typeName}</option>
              ))}
          </select>
        </div>

        <div style={{ width: '160px' }}>
          <select
            className="input"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
          >
            <option value="ALL">Tất cả hoạt động</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Ngừng hoạt động</option>
          </select>
        </div>

        <div style={{ width: '160px' }}>
          <select
            className="input"
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
          >
            <option value="ALL">Tất cả phê duyệt</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
      </div>
    </div>
  );
}
