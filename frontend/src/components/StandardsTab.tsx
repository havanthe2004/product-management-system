import React, { useState, useEffect } from 'react';
import { getQualityStandards, saveCatalog, deleteCatalog } from '../services/catalog.service';

export default function StandardsTab() {
  const [standards, setStandards] = useState<any[]>([]);

  const fetchStandards = async () => {
    try {
      const res = await getQualityStandards();
      if (res.success) setStandards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStandards();
  }, []);

  const [standardForm, setStandardForm] = useState({
    id: null as any,
    standardCode: '',
    standardName: '',
    description: '',
    status: 'ACTIVE'
  });

  const resetForm = () => {
    setStandardForm({ id: null, standardCode: '', standardName: '', description: '', status: 'ACTIVE' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCatalog('quality-standards', standardForm);
      resetForm();
      fetchStandards();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number, confirmMsg: string) => {
    if (!confirm(confirmMsg)) return;
    try {
      await deleteCatalog('quality-standards', id);
      fetchStandards();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
      {/* Form Card */}
      <div className="card" style={{ height: 'fit-content' }}>
        <h3 style={{ marginBottom: '20px' }}>{standardForm.id ? '🛡️ Sửa tiêu chuẩn kỹ thuật' : '🛡️ Thêm tiêu chuẩn kỹ thuật'}</h3>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Mã tiêu chuẩn <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" className="input" required value={standardForm.standardCode} onChange={(e) => setStandardForm({ ...standardForm, standardCode: e.target.value })} placeholder="Ví dụ: ISO 9001, TCVN" />
          </div>
          <div className="form-group">
            <label>Tên tiêu chuẩn <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" className="input" required value={standardForm.standardName} onChange={(e) => setStandardForm({ ...standardForm, standardName: e.target.value })} placeholder="Ví dụ: Tiêu chuẩn Quản lý Chất lượng" />
          </div>
          <div className="form-group">
            <label>Mô tả tiêu chuẩn</label>
            <textarea className="input" rows={3} value={standardForm.description || ''} onChange={(e) => setStandardForm({ ...standardForm, description: e.target.value })} placeholder="Mô tả nội dung tiêu chuẩn..." />
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select className="input" value={standardForm.status} onChange={(e) => setStandardForm({ ...standardForm, status: e.target.value })}>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{standardForm.id ? 'Cập nhật' : 'Thêm mới'}</button>
            {standardForm.id && (
              <button type="button" onClick={resetForm} className="btn btn-secondary">Hủy</button>
            )}
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className="table-container" style={{ alignSelf: 'start' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Mã tiêu chuẩn</th>
              <th>Tên tiêu chuẩn</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {standards.map((s) => (
              <tr key={s.id}>
                <td><code>{s.standardCode}</code></td>
                <td><strong>{s.standardName}</strong></td>
                <td>{s.description || '-'}</td>
                <td>
                  <span className={`badge ${s.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                    {s.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={() => setStandardForm({ id: s.id, standardCode: s.standardCode, standardName: s.standardName, description: s.description || '', status: s.status })} className="btn btn-secondary btn-sm">✏️ Sửa</button>
                    <button onClick={() => handleDelete(s.id, `Bạn muốn xóa tiêu chuẩn ${s.standardName}?`)} className="btn btn-danger btn-sm">🗑️ Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
