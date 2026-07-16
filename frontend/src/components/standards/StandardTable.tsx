import { truncateText } from '../../utils/productUtils';

interface StandardTableProps {
  standards: any[];
  onViewDetails: (s: any) => void;
  onEdit: (s: any) => void;
  onDelete: (id: number, name: string) => void;
  onRestore: (id: number, name: string) => void;
  onApprove: (s: any) => void;
  onReject: (s: any) => void;
  isTrashView: boolean;
  isAuthorizedToApprove: boolean;
}

export default function StandardTable({
  standards,
  onViewDetails,
  onEdit,
  onDelete,
  onRestore,
  onApprove,
  onReject,
  isTrashView,
  isAuthorizedToApprove,
}: StandardTableProps) {
  return (
    <div className="table-container" style={{ alignSelf: 'stretch', overflowX: 'auto', boxShadow: 'var(--shadow-sm)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ width: '15%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Mã tiêu chuẩn</th>
            <th style={{ width: '20%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Tên tiêu chuẩn</th>
            <th style={{ width: '25%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Mô tả</th>
            <th style={{ width: '10%', padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Hoạt động</th>
            <th style={{ width: '15%', padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Phê duyệt</th>
            <th style={{ width: '15%', padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: 'var(--text-secondary)' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {standards.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                Không có dữ liệu tiêu chuẩn nào.
              </td>
            </tr>
          ) : (
            standards.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="table-row-hover">
                <td style={{ padding: '12px 16px' }}><code>{s.standardCode}</code></td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    onClick={() => onViewDetails(s)}
                    style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    title="Xem chi tiết"
                  >
                    {s.standardName}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }} title={s.description}>
                  {truncateText(s.description, 40)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span className={`badge ${s.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                    {s.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    {s.approvalStatus === 'PENDING' ? (
                      isAuthorizedToApprove && !isTrashView ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => onApprove(s)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)', color: '#fff', padding: '3px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Phê duyệt"
                          >
                            ✔️
                          </button>
                          <button
                            onClick={() => onReject(s)}
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
                      <span className={`badge ${s.approvalStatus === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                        {s.approvalStatus === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                    {isTrashView ? (
                      <button
                        onClick={() => onRestore(s.id, s.standardName)}
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff', padding: '4px 8px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Khôi phục"
                      >
                        🔄
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => onEdit(s)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        {isAuthorizedToApprove && (
                          <button
                            onClick={() => onDelete(s.id, s.standardName)}
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
