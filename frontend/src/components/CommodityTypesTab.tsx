import React, { useState, useEffect } from 'react';
import { getCommodityTypes, getCommodityGroups, saveCatalog, deleteCatalog } from '../services/catalog.service';

export default function CommodityTypesTab() {
  const [types, setTypes] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  const fetchTypesAndGroups = async () => {
    try {
      const [resTypes, resGroups] = await Promise.all([
        getCommodityTypes(),
        getCommodityGroups()
      ]);
      if (resTypes.success) setTypes(resTypes.data);
      if (resGroups.success) setGroups(resGroups.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTypesAndGroups();
  }, []);

  const [typeForm, setTypeForm] = useState({
    id: null as any,
    typeCode: '',
    typeName: '',
    description: '',
    status: 'ACTIVE',
    groupId: ''
  });

  const resetForm = () => {
    setTypeForm({ id: null, typeCode: '', typeName: '', description: '', status: 'ACTIVE', groupId: '' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCatalog('commodity-types', typeForm);
      resetForm();
      fetchTypesAndGroups();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number, confirmMsg: string) => {
    if (!confirm(confirmMsg)) return;
    try {
      await deleteCatalog('commodity-types', id);
      fetchTypesAndGroups();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
      {/* Form Card */}
      <div className="card" style={{ height: 'fit-content' }}>
        <h3 style={{ marginBottom: '20px' }}>{typeForm.id ? '📝 Sửa loại mặt hàng' : '➕ Thêm loại mặt hàng'}</h3>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Nhóm mặt hàng liên kết <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select className="input" required value={typeForm.groupId} onChange={(e) => setTypeForm({ ...typeForm, groupId: e.target.value })}>
              <option value="">-- Chọn nhóm sản phẩm --</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.groupName} ({g.groupCode})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Mã loại <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" className="input" required value={typeForm.typeCode} onChange={(e) => setTypeForm({ ...typeForm, typeCode: e.target.value })} placeholder="Ví dụ: TIVI" />
          </div>
          <div className="form-group">
            <label>Tên loại <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" className="input" required value={typeForm.typeName} onChange={(e) => setTypeForm({ ...typeForm, typeName: e.target.value })} placeholder="Ví dụ: Ti vi thông minh" />
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea className="input" rows={3} value={typeForm.description || ''} onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })} placeholder="Mô tả loại mặt hàng..." />
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select className="input" value={typeForm.status} onChange={(e) => setTypeForm({ ...typeForm, status: e.target.value })}>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{typeForm.id ? 'Cập nhật' : 'Thêm mới'}</button>
            {typeForm.id && (
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
              <th>Mã loại</th>
              <th>Tên loại</th>
              <th>Thuộc nhóm</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.id}>
                <td><code>{t.typeCode}</code></td>
                <td><strong>{t.typeName}</strong></td>
                <td><span className="badge badge-primary">{t.group?.groupName || 'Chưa phân nhóm'}</span></td>
                <td>{t.description || '-'}</td>
                <td>
                  <span className={`badge ${t.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                    {t.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={() => setTypeForm({ id: t.id, typeCode: t.typeCode, typeName: t.typeName, description: t.description || '', status: t.status, groupId: t.group?.id?.toString() || '' })} className="btn btn-secondary btn-sm">✏️ Sửa</button>
                    <button onClick={() => handleDelete(t.id, `Bạn muốn xóa loại ${t.typeName}?`)} className="btn btn-danger btn-sm">🗑️ Xóa</button>
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
