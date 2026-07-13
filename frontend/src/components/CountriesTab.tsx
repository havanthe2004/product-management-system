import React, { useState, useEffect } from 'react';
import { getCountries, saveCatalog, deleteCatalog } from '../services/catalog.service';

export default function CountriesTab() {
  const [countries, setCountries] = useState<any[]>([]);

  const fetchCountries = async () => {
    try {
      const res = await getCountries();
      if (res.success) setCountries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const [countryForm, setCountryForm] = useState({
    id: null as any,
    isoCode: '',
    countryName: '',
    region: '',
    description: '',
    status: 'ACTIVE'
  });

  const resetForm = () => {
    setCountryForm({ id: null, isoCode: '', countryName: '', region: '', description: '', status: 'ACTIVE' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCatalog('countries', countryForm);
      resetForm();
      fetchCountries();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number, confirmMsg: string) => {
    if (!confirm(confirmMsg)) return;
    try {
      await deleteCatalog('countries', id);
      fetchCountries();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
      {/* Form Card */}
      <div className="card" style={{ height: 'fit-content' }}>
        <h3 style={{ marginBottom: '20px' }}>{countryForm.id ? '🌍 Sửa nước hợp tác' : '🌍 Thêm nước hợp tác'}</h3>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Mã ISO (Quốc tế) <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" className="input" required value={countryForm.isoCode} onChange={(e) => setCountryForm({ ...countryForm, isoCode: e.target.value })} placeholder="Ví dụ: JP, US, VN" />
          </div>
          <div className="form-group">
            <label>Tên quốc gia <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" className="input" required value={countryForm.countryName} onChange={(e) => setCountryForm({ ...countryForm, countryName: e.target.value })} placeholder="Ví dụ: Nhật Bản, Hoa Kỳ" />
          </div>
          <div className="form-group">
            <label>Khu vực</label>
            <input type="text" className="input" value={countryForm.region || ''} onChange={(e) => setCountryForm({ ...countryForm, region: e.target.value })} placeholder="Ví dụ: Châu Á, Châu Âu" />
          </div>
          <div className="form-group">
            <label>Mô tả / Ghi chú</label>
            <textarea className="input" rows={3} value={countryForm.description || ''} onChange={(e) => setCountryForm({ ...countryForm, description: e.target.value })} placeholder="Thông tin hợp tác chính..." />
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select className="input" value={countryForm.status} onChange={(e) => setCountryForm({ ...countryForm, status: e.target.value })}>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{countryForm.id ? 'Cập nhật' : 'Thêm mới'}</button>
            {countryForm.id && (
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
              <th>Mã ISO</th>
              <th>Tên quốc gia</th>
              <th>Khu vực</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {countries.map((c) => (
              <tr key={c.id}>
                <td><code>{c.isoCode}</code></td>
                <td><strong>{c.countryName}</strong></td>
                <td>{c.region || '-'}</td>
                <td>{c.description || '-'}</td>
                <td>
                  <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                    {c.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={() => setCountryForm({ id: c.id, isoCode: c.isoCode, countryName: c.countryName, region: c.region || '', description: c.description || '', status: c.status })} className="btn btn-secondary btn-sm">✏️ Sửa</button>
                    <button onClick={() => handleDelete(c.id, `Bạn muốn xóa quốc gia ${c.countryName}?`)} className="btn btn-danger btn-sm">🗑️ Xóa</button>
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
