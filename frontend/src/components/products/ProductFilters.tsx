import { useState, useEffect, useRef } from 'react';
import type { CommodityGroup, CommodityType, Country, QualityStandard } from '../../types';

interface MultiSelectDropdownProps {
  label: string;
  emoji: string;
  options: { id: number; name: string }[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
}

function MultiSelectDropdown({
  label,
  emoji,
  options,
  selectedIds,
  onChange,
  placeholder = 'Chọn...'
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleOption = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const getButtonText = () => {
    if (selectedIds.length === 0) return placeholder;
    if (selectedIds.length === 1) {
      const selected = options.find(o => o.id === selectedIds[0]);
      return selected ? selected.name : placeholder;
    }
    return `Đã chọn ${selectedIds.length} mục`;
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '6px',
        flex: '1 1 0px',
        minWidth: '220px'
      }}
    >
      <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {emoji} {label}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          height: '42px',
          padding: '0 16px 0 12px',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          backgroundColor: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '14px',
          color: selectedIds.length > 0 ? '#1e293b' : '#64748b',
          textAlign: 'left',
          fontWeight: selectedIds.length > 0 ? 600 : 400,
          transition: 'all 0.2s',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}>
          {getButtonText()}
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ 
            transition: 'transform 0.2s', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: '#64748b'
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '70px',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
            zIndex: 100,
            maxHeight: '240px',
            overflowY: 'auto',
            padding: '8px 0',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {options.length === 0 ? (
            <div style={{ padding: '8px 16px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
              Không có dữ liệu
            </div>
          ) : (
            options.map(opt => {
              const isChecked = selectedIds.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '13.5px',
                    color: isChecked ? '#1e293b' : '#334155',
                    backgroundColor: isChecked ? '#f1f5f9' : 'transparent',
                    fontWeight: isChecked ? 600 : 400,
                    transition: 'background-color 0.15s',
                    margin: 0,
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isChecked) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isChecked) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleOption(opt.id)}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {opt.name}
                  </span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

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
  countries: Country[];
  standards: QualityStandard[];
  countryFilter: number[];
  setCountryFilter: (v: number[]) => void;
  standardFilter: number[];
  setStandardFilter: (v: number[]) => void;
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
  countries,
  standards,
  countryFilter,
  setCountryFilter,
  standardFilter,
  setStandardFilter
}: ProductFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeAdvancedFiltersCount = 
    countryFilter.length + 
    standardFilter.length;

  const hasActiveAdvancedFilters = activeAdvancedFiltersCount > 0;

  return (
    <div className="card" style={{ marginBottom: '4px' }}>
      {/* Main Filter Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        
        {/* Search Box & Toggle Filter Button */}
        <div style={{ flex: 1, minWidth: '280px', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên, mã sản phẩm hoặc mô tả..."
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`btn ${showAdvanced || hasActiveAdvancedFilters ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              height: '42px',
              padding: '0 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: (showAdvanced || hasActiveAdvancedFilters) 
                ? '0 0 12px rgba(59, 130, 246, 0.3)' 
                : 'none',
              backgroundColor: (showAdvanced || hasActiveAdvancedFilters) ? undefined : '#f8fafc'
            }}
            title="Bộ lọc nâng cao theo Nước & Tiêu chuẩn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span>Bộ lọc</span>
            {hasActiveAdvancedFilters && (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                marginLeft: '2px'
              }}>
                {activeAdvancedFiltersCount}
              </span>
            )}
          </button>
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

      {/* Advanced Filters Expandable Drawer */}
      <div 
        style={{ 
          maxHeight: showAdvanced ? '220px' : '0px',
          opacity: showAdvanced ? 1 : 0,
          overflow: showAdvanced ? 'visible' : 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          marginTop: showAdvanced ? '16px' : '0px',
          paddingTop: showAdvanced ? '16px' : '0px',
          borderTop: showAdvanced ? '1px dashed #cbd5e1' : 'none',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'flex-end'
        }}
      >
        <MultiSelectDropdown
          label="Nước sản xuất"
          emoji="🌍"
          options={countries.map(c => ({ id: c.id, name: `${c.countryName} (${c.isoCode})` }))}
          selectedIds={countryFilter}
          onChange={setCountryFilter}
          placeholder="Chọn nước..."
        />

        <MultiSelectDropdown
          label="Tiêu chuẩn chất lượng"
          emoji="📜"
          options={standards.map(s => ({ id: s.id, name: `${s.standardName} (${s.standardCode})` }))}
          selectedIds={standardFilter}
          onChange={setStandardFilter}
          placeholder="Chọn tiêu chuẩn..."
        />

        {hasActiveAdvancedFilters && (
          <button
            onClick={() => {
              setCountryFilter([]);
              setStandardFilter([]);
            }}
            className="btn"
            style={{
              height: '42px',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#dc2626',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🧹 Đặt lại
          </button>
        )}
      </div>
    </div>
  );
}
