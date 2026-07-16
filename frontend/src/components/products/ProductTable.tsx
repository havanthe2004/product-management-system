import type { Commodity } from '../../types';
import { getProductImageUrl, truncateText } from '../../utils/productUtils';
import { UserRole } from '../../store/slices/authSlice';

interface ProductTableProps {
  filteredProducts: Commodity[];
  onViewDetails: (item: Commodity) => void;
  onEdit: (item: Commodity) => void;
  onDelete: (id: number, name: string) => void;
  onRestore: (id: number, name: string) => void;
  onApprove: (item: Commodity, status: 'APPROVED' | 'REJECTED') => void;
  isTrashView: boolean;
  isAuthorizedToApprove: boolean;
  userRole: string | undefined;
}

export default function ProductTable({
  filteredProducts,
  onViewDetails,
  onEdit,
  onDelete,
  onRestore,
  onApprove,
  isTrashView,
  isAuthorizedToApprove,
  userRole,
}: ProductTableProps) {
  return (
    <div className="table-container" style={{ alignSelf: 'stretch', overflowX: 'auto', boxShadow: 'var(--shadow-sm)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ width: '20%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Mặt hàng</th>
            <th style={{ width: '14%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Mã HS</th>
            <th style={{ width: '14%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Phân loại & ĐVT</th>
            <th style={{ width: '10%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Nước đối tác</th>
            <th style={{ width: '14%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Tiêu chuẩn</th>
            <th style={{ width: '8%', padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Hoạt động</th>
            <th style={{ width: '8%', padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Phê duyệt</th>
            <th style={{ width: '12%', padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: 'var(--text-secondary)' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                📭 Không tìm thấy mặt hàng nào phù hợp.
              </td>
            </tr>
          ) : (
            filteredProducts.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="table-row-hover">
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={getProductImageUrl(item.imageUrl)}
                      alt={item.commodityName}
                      style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)' }}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/image.png'; }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span
                        onClick={() => onViewDetails(item)}
                        style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600', transition: 'color 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        title="Xem chi tiết"
                      >
                        {item.commodityName}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }} title={item.description}>
                        {truncateText(item.description || '', 35)}
                      </span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <code>{item.commodityCode}</code>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                    <div>Nhóm: <span className="badge badge-primary">{item.group?.groupName || 'N/A'}</span></div>
                    <div>Loại: <strong style={{ color: 'var(--text-main)' }}>{item.type?.typeName || 'N/A'}</strong></div>
                    <div>ĐVT: <code style={{ color: 'var(--text-secondary)' }}>{item.unit?.symbol}</code></div>
                  </div>
                </td>
                {/* Separated Partner Countries Column */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                    {(item.countries || []).length > 0 ? (
                      <>
                        {(item.countries || []).slice(0, 2).map(c => (
                          <span key={c.id} style={{ fontSize: '12px', padding: '2px 6px', backgroundColor: 'var(--bg-hover)', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'inline-block' }}>
                            {c.countryName} ({c.isoCode})
                          </span>
                        ))}
                        {(item.countries || []).length > 2 && (
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }} title="Và các nước khác...">...</span>
                        )}
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>-</span>
                    )}
                  </div>
                </td>
                {/* Separated Quality Standards Column */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                    {(item.qualityStandards || []).length > 0 ? (
                      <>
                        {(item.qualityStandards || []).slice(0, 2).map(qs => (
                          <span key={qs.id} className="badge badge-success" style={{ fontSize: '9px', padding: '2px 5px' }}>
                            {qs.standardCode}
                          </span>
                        ))}
                        {(item.qualityStandards || []).length > 2 && (
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }} title="Và các tiêu chuẩn khác...">...</span>
                        )}
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>-</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span className={`badge ${item.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                    {item.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    {item.approvalStatus === 'PENDING' ? (
                      isAuthorizedToApprove && !isTrashView ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => onApprove(item, 'APPROVED')}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)', color: '#fff', padding: '3px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Phê duyệt"
                          >
                            ✔️
                          </button>
                          <button
                            onClick={() => onApprove(item, 'REJECTED')}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '3px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Từ chối"
                          >
                            ❌
                          </button>
                        </div>
                      ) : (
                        <span className="badge badge-warning">Chờ duyệt</span>
                      )
                    ) : (
                      <span className={`badge ${item.approvalStatus === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                        {item.approvalStatus === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                    {isTrashView ? (
                      <button
                        onClick={() => onRestore(item.id, item.commodityName)}
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff', padding: '4px 8px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Khôi phục"
                      >
                        🔄
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => onEdit(item)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          disabled={
                            (item.approvalStatus === 'APPROVED' || item.status === 'ACTIVE') &&
                            userRole === UserRole.OFFICER
                          }
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        {isAuthorizedToApprove && (
                          <button
                            onClick={() => onDelete(item.id, item.commodityName)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 8px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
