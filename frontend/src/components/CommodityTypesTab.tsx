import React, { useState, useEffect } from 'react';
import { getCommodityTypes, getCommodityGroups, saveCatalog, deleteCatalog, getTrashCatalog, restoreCatalog } from '../services/catalog.service';
import { useAppSelector } from '../store/hooks';

export default function CommodityTypesTab() {
  const [types, setTypes] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashView, setIsTrashView] = useState(false);
  const [viewingType, setViewingType] = useState<any | null>(null);
  const auth = useAppSelector((state) => state.auth);

  const userRole = auth.user?.role;
  const isAuthorizedToApprove = userRole === 'ADMIN' || userRole === 'MANAGER';

  const fetchTypesAndGroups = async () => {
    try {
      const [resTypes, resGroups] = await Promise.all([
        isTrashView ? getTrashCatalog('commodity-types') : getCommodityTypes(),
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
  }, [isTrashView]);

  const [typeForm, setTypeForm] = useState({
    id: null as any,
    typeCode: '',
    typeName: '',
    description: '',
    status: 'INACTIVE',
    approvalStatus: 'PENDING',
    groupId: ''
  });

  const resetForm = () => {
    setTypeForm({
      id: null,
      typeCode: '',
      typeName: '',
      description: '',
      status: 'INACTIVE',
      approvalStatus: 'PENDING',
      groupId: ''
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCatalog('commodity-types', typeForm);
      resetForm();
      setIsModalOpen(false);
      fetchTypesAndGroups();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (t: any) => {
    if (!confirm(`Bạn có chắc chắn muốn duyệt loại mặt hàng "${t.typeName}"?`)) return;
    try {
      await saveCatalog('commodity-types', {
        ...t,
        groupId: t.group?.id,
        approvalStatus: 'APPROVED'
      });
      fetchTypesAndGroups();
    } catch (err: any) {
      alert('Lỗi duyệt: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRestore = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn khôi phục loại mặt hàng "${name}"?`)) return;
    try {
      await restoreCatalog('commodity-types', id);
      fetchTypesAndGroups();
    } catch (err: any) {
      alert('Lỗi khôi phục: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Bạn muốn xóa loại mặt hàng "${name}"?`)) return;
    try {
      await deleteCatalog('commodity-types', id);
      fetchTypesAndGroups();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const truncateText = (text: string, maxLength: number = 40) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
          {isTrashView ? '🗑️ Thùng rác loại mặt hàng' : 'Danh sách loại mặt hàng'}
        </h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isAuthorizedToApprove && (
            <button
              onClick={() => setIsTrashView(!isTrashView)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isTrashView ? '📋 Xem Danh Sách' : '🗑️ Thùng Rác'}
            </button>
          )}
          {!isTrashView && (
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              ➕ Thêm loại mặt hàng
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="table-container" style={{ alignSelf: 'stretch', overflowX: 'auto', boxShadow: 'var(--shadow-sm)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ width: '7%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Mã loại</th>
              <th style={{ width: '12%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Tên loại</th>
              <th style={{ width: '12%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Thuộc nhóm</th>
              <th style={{ width: '15%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Mô tả</th>
              <th style={{ width: '10%', padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Hoạt động</th>
              <th style={{ width: '10%', padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Phê duyệt</th>
              <th style={{ width: '10%', padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: 'var(--text-secondary)' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="table-row-hover">
                <td style={{ padding: '12px 16px' }}><code>{t.typeCode}</code></td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    onClick={() => setViewingType(t)}
                    style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    title="Xem chi tiết"
                  >
                    {t.typeName}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="badge badge-primary" style={{ textTransform: 'none' }}>
                    {t.group?.groupName || 'Chưa phân nhóm'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }} title={t.description}>
                  {truncateText(t.description, 35)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span className={`badge ${t.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                    {t.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    {t.approvalStatus === 'PENDING' ? (
                      isAuthorizedToApprove && !isTrashView ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleApprove(t)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)', color: '#fff', padding: '2px 6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}
                            title="Phê duyệt"
                          >
                            ✔️ Duyệt
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Bạn muốn từ chối loại mặt hàng "${t.typeName}"?`)) return;
                              try {
                                await saveCatalog('commodity-types', {
                                  ...t,
                                  groupId: t.group?.id,
                                  approvalStatus: 'REJECTED'
                                });
                                fetchTypesAndGroups();
                              } catch (err: any) {
                                alert('Lỗi từ chối: ' + (err.response?.data?.message || err.message));
                              }
                            }}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '2px 6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}
                            title="Từ chối"
                          >
                            ❌ Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="badge badge-warning">
                          Chờ duyệt
                        </span>
                      )
                    ) : (
                      <span className={`badge ${t.approvalStatus === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                        {t.approvalStatus === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                    {isTrashView ? (
                      <button
                        onClick={() => handleRestore(t.id, t.typeName)}
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff', padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        🔄 Khôi phục
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setTypeForm({
                              id: t.id,
                              typeCode: t.typeCode,
                              typeName: t.typeName,
                              description: t.description || '',
                              status: t.status,
                              approvalStatus: t.approvalStatus,
                              groupId: t.group?.id?.toString() || ''
                            });
                            setIsModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          ✏️ Sửa
                        </button>
                        {isAuthorizedToApprove && (
                          <button
                            onClick={() => handleDelete(t.id, t.typeName)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            🗑️ Xóa
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => {
            setIsModalOpen(false);
            resetForm();
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
              animation: 'scaleUp 0.2s ease-out',
              margin: '20px',
              padding: 0,
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', padding: '16px 24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                {typeForm.id ? '📝 Sửa loại mặt hàng' : '➕ Thêm loại mặt hàng'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
              >
                ✖️
              </button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', margin: 0 }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                {(() => {
                  const isReadOnly = !!typeForm.id && (typeForm.approvalStatus === 'APPROVED' || typeForm.status === 'ACTIVE');
                  return (
                    <>
                      <div className="form-group">
                        <label>Nhóm mặt hàng liên kết <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <select 
                          className="input" 
                          required 
                          value={typeForm.groupId} 
                          onChange={(e) => setTypeForm({ ...typeForm, groupId: e.target.value })}
                          disabled={isReadOnly}
                          style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                        >
                          <option value="">-- Chọn nhóm sản phẩm --</option>
                          {groups
                            .filter(g => g.status === 'ACTIVE' || g.id.toString() === typeForm.groupId)
                            .map(g => (
                              <option key={g.id} value={g.id}>
                                {g.groupName} ({g.groupCode}){g.status !== 'ACTIVE' ? ' (Ngừng hoạt động)' : ''}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Mã loại <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input 
                          type="text" 
                          className="input" 
                          required 
                          value={typeForm.typeCode} 
                          onChange={(e) => setTypeForm({ ...typeForm, typeCode: e.target.value })} 
                          placeholder="Ví dụ: TIVI" 
                          disabled={isReadOnly}
                          style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tên loại <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input 
                          type="text" 
                          className="input" 
                          required 
                          value={typeForm.typeName} 
                          onChange={(e) => setTypeForm({ ...typeForm, typeName: e.target.value })} 
                          placeholder="Ví dụ: Ti vi thông minh" 
                          disabled={isReadOnly}
                          style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                        />
                      </div>
                      <div className="form-group">
                        <label>Mô tả</label>
                        <textarea 
                          className="input" 
                          rows={3} 
                          value={typeForm.description || ''} 
                          onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })} 
                          placeholder="Mô tả loại mặt hàng..." 
                          disabled={isReadOnly}
                          style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                        />
                        {isReadOnly && (
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                            ⚠️ Chỉ cho phép sửa đổi thông tin khi trạng thái phê duyệt khác 'Đã duyệt' và trạng thái hoạt động là 'Ngừng hoạt động'.
                          </span>
                        )}
                      </div>
                    </>
                  );
                })()}

                <div className="form-group">
                  <label>Trạng thái hoạt động</label>
                  <select 
                    className="input" 
                    value={typeForm.status} 
                    onChange={(e) => setTypeForm({ ...typeForm, status: e.target.value })}
                    disabled={typeForm.approvalStatus !== 'APPROVED' || !isAuthorizedToApprove}
                    style={typeForm.approvalStatus !== 'APPROVED' || !isAuthorizedToApprove ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                  >
                    <option value="INACTIVE">Ngừng hoạt động</option>
                    {typeForm.approvalStatus === 'APPROVED' && (
                      <option value="ACTIVE">Hoạt động</option>
                    )}
                  </select>
                  {typeForm.approvalStatus !== 'APPROVED' && (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                      ⚠️ Chỉ có thể kích hoạt hoạt động sau khi loại mặt hàng đã được phê duyệt.
                    </span>
                  )}
                  {!isAuthorizedToApprove && (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                      ⚠️ Chỉ Quản lý hoặc Admin mới có quyền chỉnh sửa trạng thái hoạt động.
                    </span>
                  )}
                </div>

                {typeForm.id ? (
                  <div className="form-group">
                    <label>Trạng thái phê duyệt</label>
                    {isAuthorizedToApprove ? (
                      <select 
                        className="input" 
                        value={typeForm.approvalStatus} 
                        onChange={(e) => setTypeForm({ ...typeForm, approvalStatus: e.target.value })}
                        disabled={typeForm.status === 'ACTIVE'}
                        style={typeForm.status === 'ACTIVE' ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                      >
                        <option value="PENDING">Chờ duyệt</option>
                        <option value="APPROVED">Đã duyệt</option>
                        <option value="REJECTED">Từ chối</option>
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        className="input" 
                        value={
                          typeForm.approvalStatus === 'APPROVED' ? 'Đã duyệt' : 
                          typeForm.approvalStatus === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'
                        } 
                        disabled 
                        style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                      />
                    )}
                    {typeForm.status === 'ACTIVE' && (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                        ⚠️ Cần chuyển trạng thái hoạt động về 'Ngừng hoạt động' trước khi thay đổi trạng thái phê duyệt.
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Trạng thái phê duyệt mặc định</label>
                    <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-hover)', borderRadius: '6px', color: 'var(--warning)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      ⏳ Chờ duyệt (Loại mới tạo sẽ cần Quản lý hoặc Admin phê duyệt)
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end', backgroundColor: 'var(--bg-hover)' }}>
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="btn btn-secondary" style={{ minWidth: '100px' }}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }}>{typeForm.id ? 'Cập nhật' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for View Details */}
      {viewingType && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setViewingType(null)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
              animation: 'scaleUp 0.2s ease-out',
              margin: '20px',
              padding: 0,
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', padding: '16px 24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                👁️ Chi tiết loại mặt hàng
              </h3>
              <button
                type="button"
                onClick={() => setViewingType(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
              >
                ✖️
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Mã loại mặt hàng</label>
                  <strong style={{ fontSize: '15px' }}>{viewingType.typeCode}</strong>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Tên loại mặt hàng</label>
                  <strong style={{ fontSize: '15px' }}>{viewingType.typeName}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Thuộc nhóm mặt hàng</label>
                  <span className="badge badge-primary" style={{ fontSize: '12px', padding: '6px 12px', textTransform: 'none' }}>
                    {viewingType.group?.groupName || 'Chưa phân nhóm'}
                  </span>
                </div>
                <div>
                  {/* Keep layout balanced */}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Mô tả chi tiết</label>
                <div style={{
                  backgroundColor: 'var(--bg-hover)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap',
                  fontSize: '14px',
                  color: 'var(--text-main)',
                  lineHeight: '1.6',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)'
                }}>
                  {viewingType.description || 'Không có mô tả.'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Trạng thái hoạt động</label>
                  <span className={`badge ${viewingType.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '12px', padding: '6px 12px' }}>
                    {viewingType.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'}
                  </span>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Trạng thái phê duyệt</label>
                  <span className={`badge ${viewingType.approvalStatus === 'APPROVED' ? 'badge-success' :
                    viewingType.approvalStatus === 'PENDING' ? 'badge-warning' : 'badge-danger'
                    }`} style={{ fontSize: '12px', padding: '6px 12px' }}>
                    {
                      viewingType.approvalStatus === 'APPROVED' ? 'Đã duyệt' :
                        viewingType.approvalStatus === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'
                    }
                  </span>
                </div>
              </div>

              {viewingType.createdAt && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Thời gian tạo</label>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(viewingType.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  {viewingType.updatedAt && (
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Cập nhật lần cuối</label>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(viewingType.updatedAt).toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)' }}>
              <button type="button" onClick={() => setViewingType(null)} className="btn btn-primary" style={{ minWidth: '100px' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
