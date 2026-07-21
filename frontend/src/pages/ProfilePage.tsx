import { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../store/hooks';
import { updateUserSuccess } from '../store/slices/authSlice';
import { getProfile, updateProfile, changePassword } from '../services/profile.service';
import type { User } from '../types';
import { DEFAULT_AVATAR } from '../layouts/Sidebar';
import { useConfirm } from '../context/ConfirmContext';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const confirm = useConfirm();

  // Sub tab state
  const [subTab, setSubTab] = useState<'info' | 'password'>('info');

  // Profile data states
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);

  // Edit form states
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Password form states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Alert states
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load profile from API on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      if (res.success && res.data) {
        const u = res.data;
        setProfile(u);
        setFullName(u.fullName || '');
        setDateOfBirth(formatDateForInput(u.dateOfBirth));
        setGender(u.gender || '');
        setPhone(u.phone || '');
        setAvatar(u.avatar || null);
        setAvatarPreview(getAvatarUrl(u.avatar));
      } else {
        showAlert('error', res.message || 'Không thể lấy thông tin cá nhân.');
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Lỗi khi tải thông tin cá nhân.');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    // Scroll to top of content area to view alert
    const contentBody = document.querySelector('.content-body');
    if (contentBody) {
      contentBody.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Auto hide success alerts after 4 seconds
    if (type === 'success') {
      setTimeout(() => {
        setAlert((prev) => (prev?.message === message ? null : prev));
      }, 4000);
    }
  };

  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const getAvatarUrl = (avatarPath: string | null | undefined) => {
    if (!avatarPath) return DEFAULT_AVATAR;
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://') || avatarPath.startsWith('data:')) {
      return avatarPath;
    }
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const hostUrl = apiBaseUrl.replace(/\/api$/, '');
    return `${hostUrl}${avatarPath}`;
  };

  // Handle avatar image selection
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('error', 'Vui lòng chọn một tệp hình ảnh.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert('error', 'Dung lượng ảnh tối đa là 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setAvatar(base64String);
      setAvatarPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Submit Profile Changes
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!fullName.trim()) {
      showAlert('error', 'Họ và tên không được để trống.');
      return;
    }

    const isConfirmedProfile = await confirm({
      title: "Xác nhận lưu thay đổi",
      message: "Bạn có chắc chắn muốn lưu các thay đổi thông tin cá nhân này không?",
      confirmText: "Lưu thay đổi",
      cancelText: "Hủy",
      type: "info"
    });
    if (!isConfirmedProfile) return;

    try {
      setSubmitting(true);
      const res = await updateProfile({
        fullName,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        phone: phone || undefined,
        avatar
      });

      if (res.success && res.data) {
        showAlert('success', 'Cập nhật thông tin cá nhân thành công!');
        // Update user state in Redux
        dispatch(updateUserSuccess(res.data));
        // Refresh local view
        setProfile(res.data);
      } else {
        showAlert('error', res.message || 'Cập nhật thông tin thất bại.');
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      showAlert('error', 'Vui lòng nhập đầy đủ các trường mật khẩu.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('error', 'Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    if (newPassword.length < 6) {
      showAlert('error', 'Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    const isConfirmedPassword = await confirm({
      title: "Xác nhận đổi mật khẩu",
      message: "Bạn có chắc chắn muốn thay đổi mật khẩu của mình không?",
      confirmText: "Đổi mật khẩu",
      cancelText: "Hủy",
      type: "warning"
    });
    if (!isConfirmedPassword) return;

    try {
      setSubmitting(true);
      const res = await changePassword({
        oldPassword,
        newPassword,
        confirmPassword
      });

      if (res.success) {
        showAlert('success', 'Đổi mật khẩu thành công!');
        // Clear fields
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showAlert('error', res.message || 'Đổi mật khẩu thất bại.');
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Mật khẩu cũ không chính xác hoặc có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
          🌀 Đang tải thông tin cá nhân...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Alert Alert Banner */}
      {alert && (
        <div 
          className={`card`}
          style={{
            marginBottom: '20px',
            padding: '14px 20px',
            borderRadius: '8px',
            backgroundColor: alert.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
            borderColor: alert.type === 'success' ? 'var(--success)' : 'var(--danger)',
            color: alert.type === 'success' ? 'var(--success)' : 'var(--danger)',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <span>{alert.type === 'success' ? '✅' : '❌'}</span>
          <span>{alert.message}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => { setSubTab('info'); setAlert(null); }}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'info' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            color: subTab === 'info' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '15px',
            padding: '8px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '-14px'
          }}
        >
          👤 Thông tin cá nhân
        </button>
        <button
          onClick={() => { setSubTab('password'); setAlert(null); }}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'password' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            color: subTab === 'password' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '15px',
            padding: '8px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '-14px'
          }}
        >
          🔑 Bảo mật & Đổi mật khẩu
        </button>
      </div>

      {subTab === 'info' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <form onSubmit={handleProfileSubmit}>
            {/* Avatar Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div 
                style={{ 
                  position: 'relative', 
                  cursor: 'pointer',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid var(--primary)',
                  boxShadow: 'var(--shadow-md)',
                  backgroundColor: 'var(--bg-main)'
                }}
                onClick={handleAvatarClick}
                title="Click để thay đổi ảnh đại diện"
              >
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div 
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: '#ffffff',
                    fontSize: '10px',
                    textAlign: 'center',
                    padding: '3px 0',
                    fontWeight: '600'
                  }}
                >
                  SỬA 📷
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Chấp nhận tệp ảnh JPG, PNG, GIF dưới 5MB
              </span>
            </div>

            {/* Profile Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Địa chỉ Email (Tên đăng nhập)</label>
                <input
                  type="text"
                  className="input"
                  value={profile?.email || ''}
                  disabled
                  style={{ backgroundColor: 'var(--bg-hover)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Họ và Tên <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="text"
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên của bạn"
                  required
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="form-group">
                <label>Số CCCD/CMND</label>
                <input
                  type="text"
                  className="input"
                  value={profile?.idCardNumber || ''}
                  disabled
                  style={{ backgroundColor: 'var(--bg-hover)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
                />
              </div>

              <div className="form-group">
                <label>Ngày sinh</label>
                <input
                  type="date"
                  className="input"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Giới tính</label>
                <select
                  className="input"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="form-group">
                <label>Vai trò</label>
                <input
                  type="text"
                  className="input"
                  value={
                    profile?.role === 'ADMIN' ? 'Quản trị viên' :
                    profile?.role === 'MANAGER' ? 'Quản lý' : 'Nhân viên'
                  }
                  disabled
                  style={{ backgroundColor: 'var(--bg-hover)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
                />
              </div>

              <div className="form-group">
                <label>Trạng thái tài khoản</label>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <span className="badge badge-success">Đang hoạt động</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ minWidth: '140px' }}
              >
                {submitting ? '💾 Đang lưu...' : '💾 Lưu thông tin'}
              </button>
            </div>
          </form>
        </div>
      )}

      {subTab === 'password' && (
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>🔐 Thay đổi mật khẩu</h3>
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label>Mật khẩu hiện tại <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="password"
                className="input"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                required
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu mới <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="password"
                className="input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                required
              />
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu mới <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="password"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới để xác nhận"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ minWidth: '140px' }}
              >
                {submitting ? '🔑 Đang xử lý...' : '🔑 Đổi mật khẩu'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
