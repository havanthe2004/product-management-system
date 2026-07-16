import { DEFAULT_AVATAR } from '../../layouts/Sidebar';

interface MemberDetailsModalProps {
  viewingMember: any;
  onClose: () => void;
  getAvatarUrl: (path: string | undefined) => string;
  formatDate: (dateStr: string) => string;
}

export default function MemberDetailsModal({
  viewingMember,
  onClose,
  getAvatarUrl,
  formatDate,
}: MemberDetailsModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>👁️ Chi tiết thành viên</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✖️</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <img
              src={getAvatarUrl(viewingMember.avatar)}
              alt="Avatar"
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== DEFAULT_AVATAR) {
                  target.src = DEFAULT_AVATAR;
                }
              }}
            />
            <div>
              <h3 style={{ margin: 0, fontSize: '18px' }}>{viewingMember.fullName}</h3>
              <code style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{viewingMember.email}</code>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>ID hệ thống</label>
              <strong>#{viewingMember.id}</strong>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Vai trò</label>
              <span className={`badge ${viewingMember.role === 'ADMIN' ? 'badge-warning' : viewingMember.role === 'MANAGER' ? 'badge-success' : 'badge-primary'}`}>
                {viewingMember.role}
              </span>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>CCCD/CMND</label>
              <strong>{viewingMember.idCardNumber || 'Chưa cập nhật'}</strong>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Trạng thái</label>
              <span className={`badge ${viewingMember.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                {viewingMember.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
              </span>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Ngày sinh</label>
              <strong>{formatDate(viewingMember.dateOfBirth)}</strong>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Giới tính</label>
              <strong>{viewingMember.gender || 'Chưa cập nhật'}</strong>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Số điện thoại</label>
              <strong>{viewingMember.phone || 'Chưa cập nhật'}</strong>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Ngày tham gia</label>
              <strong>{viewingMember.createdAt ? new Date(viewingMember.createdAt).toLocaleString('vi-VN') : 'Không rõ'}</strong>
            </div>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '24px' }}>
          <button type="button" onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
