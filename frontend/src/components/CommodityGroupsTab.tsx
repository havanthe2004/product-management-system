import React, { useState, useEffect } from 'react';
import { getCommodityGroups, saveCatalog, deleteCatalog, getTrashCatalog, restoreCatalog } from '../services/catalog.service';
import { useAppSelector } from '../store/hooks';

export default function CommodityGroupsTab() {
  const [groups, setGroups] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashView, setIsTrashView] = useState(false);
  const [viewingGroup, setViewingGroup] = useState<any | null>(null);
  const auth = useAppSelector((state) => state.auth);

  const userRole = auth.user?.role;
  const isAuthorizedToApprove = userRole === 'ADMIN' || userRole === 'MANAGER';

  const fetchGroups = async () => {
    try {
      const res = isTrashView
        ? await getTrashCatalog('commodity-groups')
        : await getCommodityGroups();
      if (res.success) setGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [isTrashView]);

  const [groupForm, setGroupForm] = useState({
    id: null as any,
    groupCode: '',
    groupName: '',
    description: '',
    status: 'INACTIVE',
    approvalStatus: 'PENDING'
  });

  const resetForm = () => {
    setGroupForm({
      id: null,
      groupCode: '',
      groupName: '',
      description: '',
      status: 'INACTIVE',
      approvalStatus: 'PENDING'
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCatalog('commodity-groups', groupForm);
      resetForm();
      setIsModalOpen(false);
      fetchGroups();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (g: any) => {
    if (!confirm(`Bạn có chắc chắn muốn duyệt nhóm mặt hàng "${g.groupName}"?`)) return;
    try {
      await saveCatalog('commodity-groups', {
        ...g,
        approvalStatus: 'APPROVED'
      });
      fetchGroups();
    } catch (err: any) {
      alert('Lỗi duyệt: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRestore = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn khôi phục nhóm mặt hàng "${name}"?`)) return;
    try {
      await restoreCatalog('commodity-groups', id);
      fetchGroups();
    } catch (err: any) {
      alert('Lỗi khôi phục: ' + (err.response?.data?.message || err.message));
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
          {isTrashView ? '🗑️ Thùng rác nhóm mặt hàng' : 'Danh sách nhóm mặt hàng'}
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
              ➕ Thêm nhóm mặt hàng
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="table-container" style={{ alignSelf: 'stretch', overflowX: 'auto', boxShadow: 'var(--shadow-sm)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ width: '10%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Mã nhóm</th>
              <th style={{ width: '20%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Tên nhóm</th>
              <th style={{ width: '20%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Mô tả</th>
              <th style={{ width: '15%', padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Hoạt động</th>
              <th style={{ width: '17%', padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Phê duyệt</th>
              <th style={{ width: '18%', padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: 'var(--text-secondary)' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="table-row-hover">
                <td style={{ padding: '12px 16px' }}><code>{g.groupCode}</code></td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    onClick={() => setViewingGroup(g)}
                    style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    title="Xem chi tiết"
                  >
                    {g.groupName}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }} title={g.description}>
                  {truncateText(g.description, 45)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span className={`badge ${g.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                    {g.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    {g.approvalStatus === 'PENDING' ? (
                      isAuthorizedToApprove && !isTrashView ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleApprove(g)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)', color: '#fff', padding: '2px 6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}
                            title="Phê duyệt"
                          >
                            ✔️ Duyệt
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Bạn muốn từ chối nhóm mặt hàng "${g.groupName}"?`)) return;
                              try {
                                await saveCatalog('commodity-groups', { ...g, approvalStatus: 'REJECTED' });
                                fetchGroups();
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
                      <span className={`badge ${g.approvalStatus === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                        {g.approvalStatus === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                    {isTrashView ? (
                      <button
                        onClick={() => handleRestore(g.id, g.groupName)}
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff', padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        🔄 Khôi phục
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setGroupForm({
                              id: g.id,
                              groupCode: g.groupCode,
                              groupName: g.groupName,
                              description: g.description || '',
                              status: g.status,
                              approvalStatus: g.approvalStatus
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
                            onClick={() => handleDelete(g.id, `Bạn muốn xóa nhóm ${g.groupName}?`)}
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
                {groupForm.id ? '📝 Sửa nhóm mặt hàng' : '➕ Thêm nhóm mặt hàng'}
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
                  const isReadOnly = !!groupForm.id && (groupForm.approvalStatus === 'APPROVED' || groupForm.status === 'ACTIVE');
                  return (
                    <>
                      <div className="form-group">
                        <label>Mã nhóm <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input 
                          type="text" 
                          className="input" 
                          required 
                          value={groupForm.groupCode} 
                          onChange={(e) => setGroupForm({ ...groupForm, groupCode: e.target.value })} 
                          placeholder="Ví dụ: DTGD" 
                          disabled={isReadOnly}
                          style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tên nhóm <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input 
                          type="text" 
                          className="input" 
                          required 
                          value={groupForm.groupName} 
                          onChange={(e) => setGroupForm({ ...groupForm, groupName: e.target.value })} 
                          placeholder="Ví dụ: Điện tử Gia Dụng" 
                          disabled={isReadOnly}
                          style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                        />
                      </div>
                      <div className="form-group">
                        <label>Mô tả</label>
                        <textarea 
                          className="input" 
                          rows={3} 
                          value={groupForm.description || ''} 
                          onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })} 
                          placeholder="Mô tả nhóm mặt hàng..." 
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
                    value={groupForm.status} 
                    onChange={(e) => setGroupForm({ ...groupForm, status: e.target.value })}
                    disabled={groupForm.approvalStatus !== 'APPROVED' || !isAuthorizedToApprove}
                    style={groupForm.approvalStatus !== 'APPROVED' || !isAuthorizedToApprove ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                  >
                    <option value="INACTIVE">Ngừng hoạt động</option>
                    {groupForm.approvalStatus === 'APPROVED' && (
                      <option value="ACTIVE">Hoạt động</option>
                    )}
                  </select>
                  {groupForm.approvalStatus !== 'APPROVED' && (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                      ⚠️ Chỉ có thể kích hoạt hoạt động sau khi nhóm mặt hàng đã được phê duyệt.
                    </span>
                  )}
                  {!isAuthorizedToApprove && (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                      ⚠️ Chỉ Quản lý hoặc Admin mới có quyền chỉnh sửa trạng thái hoạt động.
                    </span>
                  )}
                </div>

                {groupForm.id ? (
                  <div className="form-group">
                    <label>Trạng thái phê duyệt</label>
                    {isAuthorizedToApprove ? (
                      <select 
                        className="input" 
                        value={groupForm.approvalStatus} 
                        onChange={(e) => setGroupForm({ ...groupForm, approvalStatus: e.target.value })}
                        disabled={groupForm.status === 'ACTIVE'}
                        style={groupForm.status === 'ACTIVE' ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
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
                          groupForm.approvalStatus === 'APPROVED' ? 'Đã duyệt' : 
                          groupForm.approvalStatus === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'
                        } 
                        disabled 
                        style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                      />
                    )}
                    {groupForm.status === 'ACTIVE' && (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                        ⚠️ Cần chuyển trạng thái hoạt động về 'Ngừng hoạt động' trước khi thay đổi trạng thái phê duyệt.
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Trạng thái phê duyệt mặc định</label>
                    <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-hover)', borderRadius: '6px', color: 'var(--warning)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      ⏳ Chờ duyệt (Nhóm mới tạo sẽ cần Quản lý hoặc Admin phê duyệt)
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end', backgroundColor: 'var(--bg-hover)' }}>
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="btn btn-secondary" style={{ minWidth: '100px' }}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }}>{groupForm.id ? 'Cập nhật' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for View Details */}
      {viewingGroup && (
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
          onClick={() => setViewingGroup(null)}
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
                👁️ Chi tiết nhóm mặt hàng
              </h3>
              <button
                type="button"
                onClick={() => setViewingGroup(null)}
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
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Mã nhóm mặt hàng</label>
                  <strong style={{ fontSize: '15px' }}>{viewingGroup.groupCode}</strong>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Tên nhóm mặt hàng</label>
                  <strong style={{ fontSize: '15px' }}>{viewingGroup.groupName}</strong>
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
                  {viewingGroup.description || 'Không có mô tả.'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Trạng thái hoạt động</label>
                  <span className={`badge ${viewingGroup.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '12px', padding: '6px 12px' }}>
                    {viewingGroup.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'}
                  </span>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Trạng thái phê duyệt</label>
                  <span className={`badge ${viewingGroup.approvalStatus === 'APPROVED' ? 'badge-success' :
                    viewingGroup.approvalStatus === 'PENDING' ? 'badge-warning' : 'badge-danger'
                    }`} style={{ fontSize: '12px', padding: '6px 12px' }}>
                    {
                      viewingGroup.approvalStatus === 'APPROVED' ? 'Đã duyệt' :
                        viewingGroup.approvalStatus === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'
                    }
                  </span>
                </div>
              </div>

              {viewingGroup.createdAt && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Thời gian tạo</label>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(viewingGroup.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  {viewingGroup.updatedAt && (
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Cập nhật lần cuối</label>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(viewingGroup.updatedAt).toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)' }}>
              <button type="button" onClick={() => setViewingGroup(null)} className="btn btn-primary" style={{ minWidth: '100px' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
