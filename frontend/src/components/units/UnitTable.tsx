import { truncateText } from '../../utils/productUtils';

interface UnitTableProps {
  dbUnits: any[];
  onViewDetails: (u: any) => void;
  onEdit: (u: any) => void;
  onDelete: (id: number, name: string) => void;
  onRestore: (id: number, name: string) => void;
  onApprove: (u: any) => void;
  onReject: (u: any) => void;
  isTrashView: boolean;
  isAuthorizedToApprove: boolean;
}

export default function UnitTable({
  dbUnits,
  onViewDetails,
  onEdit,
  onDelete,
  onRestore,
  onApprove,
  onReject,
  isTrashView,
  isAuthorizedToApprove,
}: UnitTableProps) {
  return (
    <div className="table-container" style={{ alignSelf: 'stretch', overflowX: 'auto', boxShadow: 'var(--shadow-sm)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ width: '15%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Mã đơn vị</th>
            <th style={{ width: '20%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Tên đơn vị</th>
            <th style={{ width: '15%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Ký hiệu</th>
            <th style={{ width: '20%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Mô tả</th>
            <th style={{ width: '10%', padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Hoạt động</th>
            <th style={{ width: '10%', padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Phê duyệt</th>
            <th style={{ width: '10%', padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: 'var(--text-secondary)' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {dbUnits.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                Không có dữ liệu đơn vị tính nào.
              </td>
            </tr>
          ) : (
            dbUnits.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="table-row-hover">
                <td style={{ padding: '12px 16px' }}><code>{u.unitCode || '-'}</code></td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    onClick={() => onViewDetails(u)}
                    style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    title="Xem chi tiết"
                  >
                    {u.unitName}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}><code>{u.symbol}</code></td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }} title={u.description}>
                  {truncateText(u.description, 35)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                    {u.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    {u.approvalStatus === 'PENDING' ? (
                      isAuthorizedToApprove && !isTrashView ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => onApprove(u)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)', color: '#fff', padding: '3px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Phê duyệt"
                          >
                            ✔️
                          </button>
                          <button
                            onClick={() => onReject(u)}
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
                      <span className={`badge ${u.approvalStatus === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                        {u.approvalStatus === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                    {isTrashView ? (
                      <button
                        onClick={() => onRestore(u.id, u.unitName)}
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff', padding: '4px 8px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Khôi phục"
                      >
                        🔄
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => onEdit(u)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        {isAuthorizedToApprove && (
                          <button
                            onClick={() => onDelete(u.id, u.unitName)}
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
