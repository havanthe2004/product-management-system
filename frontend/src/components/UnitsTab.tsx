import React, { useState, useEffect } from 'react';
import { getUnits, saveCatalog, deleteCatalog } from '../services/catalog.service';

export default function UnitsTab() {
  const [dbUnits, setDbUnits] = useState<any[]>([]);

  const fetchUnits = async () => {
    try {
      const res = await getUnits();
      if (res.success) setDbUnits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const [unitForm, setUnitForm] = useState({
    id: null as any,
    unitCode: '',
    unitName: '',
    symbol: '',
    description: '',
    status: 'ACTIVE'
  });

  const resetForm = () => {
    setUnitForm({ id: null, unitCode: '', unitName: '', symbol: '', description: '', status: 'ACTIVE' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCatalog('units', unitForm);
      resetForm();
      fetchUnits();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number, confirmMsg: string) => {
    if (!confirm(confirmMsg)) return;
    try {
      await deleteCatalog('units', id);
      fetchUnits();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
      {/* Form Card */}
      <div className="card" style={{ height: 'fit-content' }}>
        <h3 style={{ marginBottom: '20px' }}>{unitForm.id ? '📏 Sửa đơn vị đo lường' : '📏 Thêm đơn vị đo lường'}</h3>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Mã đơn vị</label>
            <input type="text" className="input" value={unitForm.unitCode} onChange={(e) => setUnitForm({ ...unitForm, unitCode: e.target.value })} placeholder="Ví dụ: CAI, HOP" />
          </div>
          <div className="form-group">
            <label>Tên đơn vị <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" className="input" required value={unitForm.unitName} onChange={(e) => setUnitForm({ ...unitForm, unitName: e.target.value })} placeholder="Ví dụ: Cái, Hộp" />
          </div>
          <div className="form-group">
            <label>Ký hiệu hiển thị <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" className="input" required value={unitForm.symbol} onChange={(e) => setUnitForm({ ...unitForm, symbol: e.target.value })} placeholder="Ví dụ: cái, hộp" />
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea className="input" rows={3} value={unitForm.description || ''} onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })} placeholder="Mô tả đơn vị..." />
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select className="input" value={unitForm.status} onChange={(e) => setUnitForm({ ...unitForm, status: e.target.value })}>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{unitForm.id ? 'Cập nhật' : 'Thêm mới'}</button>
            {unitForm.id && (
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
              <th>Mã đơn vị</th>
              <th>Tên đơn vị</th>
              <th>Ký hiệu</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {dbUnits.map((u) => (
              <tr key={u.id}>
                <td><code>{u.unitCode || '-'}</code></td>
                <td><strong>{u.unitName}</strong></td>
                <td><code>{u.symbol}</code></td>
                <td>{u.description || '-'}</td>
                <td>
                  <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                    {u.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={() => setUnitForm({ id: u.id, unitCode: u.unitCode || '', unitName: u.unitName, symbol: u.symbol, description: u.description || '', status: u.status })} className="btn btn-secondary btn-sm">✏️ Sửa</button>
                    <button onClick={() => handleDelete(u.id, `Bạn muốn xóa đơn vị ${u.unitName}?`)} className="btn btn-danger btn-sm">🗑️ Xóa</button>
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
