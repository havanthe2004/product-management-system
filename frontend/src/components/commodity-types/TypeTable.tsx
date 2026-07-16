import { truncateText } from '../../utils/productUtils';

interface TypeTableProps {
  types: any[];
  onViewDetails: (t: any) => void;
  onEdit: (t: any) => void;
  onDelete: (id: number, name: string) => void;
  onRestore: (id: number, name: string) => void;
  onApprove: (t: any) => void;
  onReject: (t: any) => void;
  isTrashView: boolean;
  isAuthorizedToApprove: boolean;
}

export default function TypeTable({
  types,
  onViewDetails,
  onEdit,
  onDelete,
  onRestore,
  onApprove,
  onReject,
  isTrashView,
  isAuthorizedToApprove,
}: TypeTableProps) {
  return (
    <div className="table-container" style={{ alignSelf: 'stretch', overflowX: 'auto', boxShadow: 'var(--shadow-sm)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ width: '10%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Mã loại</th>
            <th style={{ width: '15%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Tên loại</th>
            <th style={{ width: '15%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Thuộc nhóm</th>
            <th style={{ width: '20%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Mô tả</th>
            <th style={{ width: '10%', padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Hoạt động</th>
            <th style={{ width: '10%', padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Phê duyệt</th>
            <th style={{ width: '10%', padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: 'var(--text-secondary)' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {types.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                Không có dữ liệu loại mặt hàng nào.
              </td>
            </tr>
          ) : (
            types.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="table-row-hover">
                <td style={{ padding: '12px 16px' }}><code>{t.typeCode}</code></td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    onClick={() => onViewDetails(t)}
                    style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    title="Xem chi tiết"
                  >
                    {t.typeName}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="badge badge-primary" style={{ textTransform: 'none' }}>
                    {t.group?.groupName || 'Chưa phân nhóm'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }} title={t.description}>
                  {truncateText(t.description, 35)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span className={`badge ${t.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                    {t.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    {t.approvalStatus === 'PENDING' ? (
                      isAuthorizedToApprove && !isTrashView ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => onApprove(t)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)', color: '#fff', padding: '3px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Phê duyệt"
                          >
                            ✔️
                          </button>
                          <button
                            onClick={() => onReject(t)}
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
                      <span className={`badge ${t.approvalStatus === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                        {t.approvalStatus === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                    {isTrashView ? (
                      <button
                        onClick={() => onRestore(t.id, t.typeName)}
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff', padding: '4px 8px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Khôi phục"
                      >
                        🔄
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => onEdit(t)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        {isAuthorizedToApprove && (
                          <button
                            onClick={() => onDelete(t.id, t.typeName)}
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
