import { DEFAULT_AVATAR } from '../../layouts/Sidebar';

interface MemberTableProps {
  members: any[];
  onViewDetails: (m: any) => void;
  onUpdateRole: (id: number, role: string) => void;
  onToggleStatus: (id: number, status: string) => void;
  auth: any;
  getAvatarUrl: (path: string | undefined) => string;
}

export default function MemberTable({
  members,
  onViewDetails,
  onUpdateRole,
  onToggleStatus,
  auth,
  getAvatarUrl,
}: MemberTableProps) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Họ và tên</th>
            <th>Email liên kết</th>
            <th>Điện thoại</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th style={{ textAlign: 'right' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td>#{m.id}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src={getAvatarUrl(m.avatar)}
                    alt="Avatar"
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== DEFAULT_AVATAR) {
                        target.src = DEFAULT_AVATAR;
                      }
                    }}
                  />
                  <strong>{m.fullName}</strong>
                </div>
              </td>
              <td><code>{m.email}</code></td>
              <td>{m.phone || '-'}</td>
              <td>
                {m.email === auth.user?.email ? (
                  <span className="badge badge-warning" style={{ textTransform: 'uppercase' }}>
                    {m.role} (Bạn)
                  </span>
                ) : (
                  <select
                    value={m.role}
                    onChange={(e) => onUpdateRole(m.id, e.target.value)}
                    className="input"
                    style={{ padding: '4px 8px', fontSize: '13px', width: '130px', margin: 0, height: '32px' }}
                  >
                    <option value="OFFICER">OFFICER</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                )}
              </td>
              <td>
                <span className={`badge ${m.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                  {m.status === 'ACTIVE' ? 'Đang mở' : 'Đã khóa'}
                </span>
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button onClick={() => onViewDetails(m)} className="btn btn-secondary btn-sm" title="Xem chi tiết">
                    👁️
                  </button>
                  <button
                    onClick={() => onToggleStatus(m.id, m.status)}
                    className={`btn btn-sm ${m.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`}
                    disabled={m.email === auth.user?.email}
                    title={m.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                  >
                    {m.status === 'ACTIVE' ? '🔒' : '🔑'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
