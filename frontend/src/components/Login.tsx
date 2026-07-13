import React, { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { loginSuccess } from '../store/slices/authSlice';

type Mode = 'login' | 'register' | 'forgot' | 'reset';

export default function Login() {
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const API_URL = 'http://localhost:3000/api/auth';

  const resetMessages = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    resetMessages();

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Đăng nhập thất bại.');
      }

      dispatch(loginSuccess({
        user: json.data.user,
        token: json.data.accessToken
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword, fullName })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Đăng ký thất bại.');
      }

      setSuccessMsg('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      setMode('login');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    resetMessages();

    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Gửi yêu cầu thất bại.');
      }

      setSuccessMsg('Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn.');
      setMode('reset');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword, confirmPassword })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Đặt lại mật khẩu thất bại.');
      }

      setSuccessMsg('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
      setMode('login');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay fade-in">
      <div className="login-card animate-scaleUp">
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <h2 className="login-title">Đăng Nhập</h2>
            <p className="login-subtitle">Chào mừng bạn quay trở lại với ProMan</p>

            {error && <div className="login-alert login-alert-danger">⚠️ {error}</div>}
            {successMsg && <div className="login-alert login-alert-success">✅ {successMsg}</div>}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                required
                className="input"
                placeholder="ten@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                required
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <span className="login-link" onClick={() => { setMode('forgot'); resetMessages(); }}>
                Quên mật khẩu?
              </span>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            <p className="login-footer-text">
              Chưa có tài khoản?{' '}
              <span className="login-link" onClick={() => { setMode('register'); resetMessages(); }}>
                Đăng ký ngay
              </span>
            </p>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <h2 className="login-title">Đăng Ký</h2>
            <p className="login-subtitle">Tạo tài khoản quản lý sản phẩm ProMan</p>

            {error && <div className="login-alert login-alert-danger">⚠️ {error}</div>}

            <div className="form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                required
                className="input"
                placeholder="Nguyen Van A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                required
                className="input"
                placeholder="ten@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  required
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu</label>
                <input
                  type="password"
                  required
                  className="input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '16px' }}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
            </button>

            <p className="login-footer-text">
              Đã có tài khoản?{' '}
              <span className="login-link" onClick={() => { setMode('login'); resetMessages(); }}>
                Đăng nhập
              </span>
            </p>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <h2 className="login-title">Quên Mật Khẩu</h2>
            <p className="login-subtitle">Nhập email của bạn để nhận mã OTP khôi phục</p>

            {error && <div className="login-alert login-alert-danger">⚠️ {error}</div>}

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>Email tài khoản</label>
              <input
                type="email"
                required
                className="input"
                placeholder="ten@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>

            <p className="login-footer-text">
              <span className="login-link" onClick={() => { setMode('login'); resetMessages(); }}>
                Quay lại đăng nhập
              </span>
            </p>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <h2 className="login-title">Đặt Lại Mật Khẩu</h2>
            <p className="login-subtitle">Nhập mã OTP đã nhận và thiết lập mật khẩu mới</p>

            {error && <div className="login-alert login-alert-danger">⚠️ {error}</div>}
            {successMsg && <div className="login-alert login-alert-success">✅ {successMsg}</div>}

            <div className="form-group">
              <label>Email tài khoản</label>
              <input
                type="email"
                disabled
                className="input"
                value={email}
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label>Mã OTP (6 chữ số)</label>
              <input
                type="text"
                required
                maxLength={6}
                className="input"
                placeholder="Nhập 6 số"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  className="input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu</label>
                <input
                  type="password"
                  required
                  className="input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '16px' }}>
              {loading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
            </button>

            <p className="login-footer-text">
              <span className="login-link" onClick={() => { setMode('login'); resetMessages(); }}>
                Hủy và quay lại đăng nhập
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
