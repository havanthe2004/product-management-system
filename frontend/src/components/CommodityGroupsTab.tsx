import React, { useState, useEffect } from 'react';
import { getCommodityGroups, saveCatalog, deleteCatalog } from '../services/catalog.service';

export default function CommodityGroupsTab() {
  const [groups, setGroups] = useState<any[]>([]);

  const fetchGroups = async () => {
    try {
      const res = await getCommodityGroups();
      if (res.success) setGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const [groupForm, setGroupForm] = useState({
    id: null as any,
    groupCode: '',
    groupName: '',
    description: '',
    status: 'ACTIVE'
  });

  const resetForm = () => {
    setGroupForm({ id: null, groupCode: '', groupName: '', description: '', status: 'ACTIVE' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCatalog('commodity-groups', groupForm);
      resetForm();
      fetchGroups();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number, confirmMsg: string) => {
    if (!confirm(confirmMsg)) return;
    try {
      await deleteCatalog('commodity-groups', id);
      fetchGroups();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
      {/* Form Card */}
      <div className="card" style={{ height: 'fit-content' }}>
        <h3 style={{ marginBottom: '20px' }}>{groupForm.id ? '📝 Sửa nhóm mặt hàng' : '➕ Thêm nhóm mặt hàng'}</h3>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Mã nhóm <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" className="input" required value={groupForm.groupCode} onChange={(e) => setGroupForm({ ...groupForm, groupCode: e.target.value })} placeholder="Ví dụ: DTGD" />
          </div>
          <div className="form-group">
            <label>Tên nhóm <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" className="input" required value={groupForm.groupName} onChange={(e) => setGroupForm({ ...groupForm, groupName: e.target.value })} placeholder="Ví dụ: Điện tử Gia Dụng" />
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea className="input" rows={3} value={groupForm.description || ''} onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })} placeholder="Mô tả nhóm mặt hàng..." />
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select className="input" value={groupForm.status} onChange={(e) => setGroupForm({ ...groupForm, status: e.target.value })}>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{groupForm.id ? 'Cập nhật' : 'Thêm mới'}</button>
            {groupForm.id && (
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
              <th>Mã nhóm</th>
              <th>Tên nhóm</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id}>
                <td><code>{g.groupCode}</code></td>
                <td><strong>{g.groupName}</strong></td>
                <td>{g.description || '-'}</td>
                <td>
                  <span className={`badge ${g.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                    {g.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={() => setGroupForm({ id: g.id, groupCode: g.groupCode, groupName: g.groupName, description: g.description || '', status: g.status })} className="btn btn-secondary btn-sm">✏️ Sửa</button>
                    <button onClick={() => handleDelete(g.id, `Bạn muốn xóa nhóm ${g.groupName}?`)} className="btn btn-danger btn-sm">🗑️ Xóa</button>
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
