interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);

  if (safeTotalPages <= 1 && !onPageSizeChange) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show (e.g. max 5 pages around current page)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(safeTotalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginTop: '16px',
        padding: '12px 0',
        borderTop: '1px solid var(--border-color, #e2e8f0)'
      }}
    >
      {/* Items info & Page size selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#64748b' }}>
        <span>
          Hiển thị <strong>{totalItems > 0 ? startItem : 0}</strong> - <strong>{endItem}</strong> trong số{' '}
          <strong>{totalItems}</strong> bản ghi
        </span>

        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Số hàng:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                outline: 'none',
                fontSize: '14px'
              }}
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* First Button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={buttonStyle(currentPage === 1)}
        >
          «
        </button>

        {/* Prev Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={buttonStyle(currentPage === 1)}
        >
          ‹
        </button>

        {/* Page Numbers */}
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={pageNumberButtonStyle(isActive)}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === safeTotalPages}
          style={buttonStyle(currentPage === safeTotalPages)}
        >
          ›
        </button>

        {/* Last Button */}
        <button
          onClick={() => onPageChange(safeTotalPages)}
          disabled={currentPage === safeTotalPages}
          style={buttonStyle(currentPage === safeTotalPages)}
        >
          »
        </button>
      </div>
    </div>
  );
}

// Helpers for styling buttons
function buttonStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
    color: disabled ? '#94a3b8' : '#334155',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    transition: 'all 0.2s ease',
    outline: 'none'
  };
}

function pageNumberButtonStyle(isActive: boolean): React.CSSProperties {
  return {
    padding: '6px 12px',
    borderRadius: '6px',
    border: isActive ? '1px solid #4f46e5' : '1px solid #cbd5e1',
    backgroundColor: isActive ? '#4f46e5' : '#ffffff',
    color: isActive ? '#ffffff' : '#334155',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    transition: 'all 0.2s ease',
    outline: 'none'
  };
}
