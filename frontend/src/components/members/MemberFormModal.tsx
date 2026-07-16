import React from 'react';

interface MemberFormModalProps {
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  userForm: any;
  setUserForm: React.Dispatch<React.SetStateAction<any>>;
}

export default function MemberFormModal({
  onClose,
  onSave,
  userForm,
  setUserForm,
}: MemberFormModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>➕ Thêm thành viên mới</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✖️</button>
        </div>
        <form onSubmit={onSave}>
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
            <button type="button" onClick={onClose} className="btn btn-secondary">Hủy</button>
            <button type="submit" className="btn btn-primary">Tạo thành viên</button>
          </div>
        </form>
      </div>
    </div>
  );
}
