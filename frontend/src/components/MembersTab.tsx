import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import * as userService from '../services/user.service';

export default function MembersTab() {
  const [members, setMembers] = useState<any[]>([]);

  const fetchMembers = async () => {
    try {
      const res = await userService.getUsers();
      if (res.success) setMembers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);
  const auth = useAppSelector((state) => state.auth);

  // Modal states for User
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<any | null>(null);

  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    idCardNumber: '',
    dob: '',
    gender: '',
    phone: '',
    roleName: 'OFFICER'
  });

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.fullName || !userForm.email || !userForm.password || !userForm.idCardNumber || !userForm.roleName) {
      alert("Vui lòng điền các thông tin bắt buộc!");
      return;
    }
    try {
      await userService.createUser(userForm);

      setIsUserModalOpen(false);
      setUserForm({
        fullName: '',
        email: '',
        password: '',
        idCardNumber: '',
        dob: '',
        gender: '',
        phone: '',
        roleName: 'OFFICER'
      });
      fetchMembers();
      alert("Tạo tài khoản thành công!");
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Update role
  const handleUpdateMemberRole = async (id: number, targetRole: string) => {
    if (!confirm(`Bạn có muốn đổi quyền của thành viên này sang ${targetRole} không?`)) {
      fetchMembers();
      return;
    }
    try {
      await userService.updateUserRole(id, targetRole);
      fetchMembers();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
      fetchMembers();
    }
  };

  // Lock/Unlock Member
  const handleToggleMemberStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    const actionMsg = nextStatus === 'ACTIVE' ? 'mở khóa' : 'khóa';
    if (!confirm(`Bạn có muốn ${actionMsg} tài khoản thành viên này không?`)) return;
    try {
      await userService.toggleUserStatus(id, nextStatus);
      fetchMembers();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Chưa cập nhật';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>Danh sách thành viên</h3>
        <button onClick={() => setIsUserModalOpen(true)} className="btn btn-primary">
          ➕ Thêm thành viên
        </button>
      </div>

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
                      src={m.avatar || '../../public/image.png'}
                      alt="Avatar"
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
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
                      onChange={(e) => handleUpdateMemberRole(m.id, e.target.value)}
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
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={() => setViewingMember(m)} className="btn btn-secondary btn-sm">
                      👁️ Xem chi tiết
                    </button>
                    <button onClick={() => handleToggleMemberStatus(m.id, m.status)} className={`btn btn-sm ${m.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`} disabled={m.email === auth.user?.email}>
                      {m.status === 'ACTIVE' ? '🔒 Khóa' : '🔑 Mở khóa'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal - View User Details */}
      {viewingMember && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>👁️ Chi tiết thành viên</h2>
              <button onClick={() => setViewingMember(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✖️</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <img
                  src={viewingMember.avatar || '../../public/image.png'}
                  alt="Avatar"
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.png';
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
              <button type="button" onClick={() => setViewingMember(null)} className="btn btn-primary" style={{ width: '100%' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Create User */}
      {isUserModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>➕ Thêm thành viên mới</h2>
              <button onClick={() => setIsUserModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✖️</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Họ và tên <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input type="text" required className="input" value={userForm.fullName} onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input type="email" required className="input" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Mật khẩu <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input type="password" required className="input" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label>CCCD/CMND <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input type="text" required className="input" value={userForm.idCardNumber} onChange={(e) => setUserForm({ ...userForm, idCardNumber: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input type="date" className="input" value={userForm.dob} onChange={(e) => setUserForm({ ...userForm, dob: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Giới tính</label>
                  <select className="input" value={userForm.gender} onChange={(e) => setUserForm({ ...userForm, gender: e.target.value })}>
                    <option value="">Chọn...</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Điện thoại</label>
                  <input type="tel" className="input" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Vai trò <span style={{ color: 'var(--danger)' }}>*</span></label>
                <select className="input" value={userForm.roleName} onChange={(e) => setUserForm({ ...userForm, roleName: e.target.value })}>
                  <option value="OFFICER">OFFICER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="btn btn-secondary">Hủy</button>
                <button type="submit" className="btn btn-primary">Tạo thành viên</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
