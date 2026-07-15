import React, { useState, useEffect } from 'react';
import { getQualityStandards, saveCatalog, deleteCatalog, getTrashCatalog, restoreCatalog } from '../services/catalog.service';
import { useAppSelector } from '../store/hooks';

export default function StandardsTab() {
  const [standards, setStandards] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashView, setIsTrashView] = useState(false);
  const [viewingStandard, setViewingStandard] = useState<any | null>(null);
  const auth = useAppSelector((state) => state.auth);

  const userRole = auth.user?.role;
  const isAuthorizedToApprove = userRole === 'ADMIN' || userRole === 'MANAGER';

  const fetchStandards = async () => {
    try {
      const res = isTrashView
        ? await getTrashCatalog('quality-standards')
        : await getQualityStandards();
      if (res.success) setStandards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStandards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrashView]);

  const [standardForm, setStandardForm] = useState({
    id: null as any,
    standardCode: '',
    standardName: '',
    description: '',
    status: 'INACTIVE',
    approvalStatus: 'PENDING'
  });

  const resetForm = () => {
    setStandardForm({
      id: null,
      standardCode: '',
      standardName: '',
      description: '',
      status: 'INACTIVE',
      approvalStatus: 'PENDING'
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCatalog('quality-standards', standardForm);
      resetForm();
      setIsModalOpen(false);
      fetchStandards();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (s: any) => {
    if (!confirm(`Bạn có chắc chắn muốn duyệt tiêu chuẩn "${s.standardName}"?`)) return;
    try {
      await saveCatalog('quality-standards', {
        ...s,
        approvalStatus: 'APPROVED'
      });
      fetchStandards();
    } catch (err: any) {
      alert('Lỗi duyệt: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRestore = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn khôi phục tiêu chuẩn "${name}"?`)) return;
    try {
      await restoreCatalog('quality-standards', id);
      fetchStandards();
    } catch (err: any) {
      alert('Lỗi khôi phục: ' + (err.response?.data?.message || err.message));
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
          {isTrashView ? '🗑️ Thùng rác tiêu chuẩn kỹ thuật' : 'Danh sách tiêu chuẩn kỹ thuật'}
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
              ➕ Thêm tiêu chuẩn kỹ thuật
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="table-container" style={{ alignSelf: 'stretch', overflowX: 'auto', boxShadow: 'var(--shadow-sm)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ width: '10%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Mã tiêu chuẩn</th>
              <th style={{ width: '18%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Tên tiêu chuẩn</th>
              <th style={{ width: '25%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Mô tả</th>
              <th style={{ width: '15%', padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Hoạt động</th>
              <th style={{ width: '15%', padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Phê duyệt</th>
              <th style={{ width: '17%', padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: 'var(--text-secondary)' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {standards.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Không có dữ liệu tiêu chuẩn nào.
                </td>
              </tr>
            ) : (
              standards.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '12px 16px' }}><code>{s.standardCode}</code></td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      onClick={() => setViewingStandard(s)}
                      style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600', transition: 'color 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                      title="Xem chi tiết"
                    >
                      {s.standardName}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }} title={s.description}>
                    {truncateText(s.description, 40)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span className={`badge ${s.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {s.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      {s.approvalStatus === 'PENDING' ? (
                        isAuthorizedToApprove && !isTrashView ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleApprove(s)}
                              className="btn btn-primary btn-sm"
                              style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)', color: '#fff', padding: '2px 6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}
                              title="Phê duyệt"
                            >
                              ✔️ Duyệt
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Bạn muốn từ chối tiêu chuẩn "${s.standardName}"?`)) return;
                                try {
                                  await saveCatalog('quality-standards', { ...s, approvalStatus: 'REJECTED' });
                                  fetchStandards();
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
                        <span className={`badge ${s.approvalStatus === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                          {s.approvalStatus === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                      {isTrashView ? (
                        <button
                          onClick={() => handleRestore(s.id, s.standardName)}
                          className="btn btn-primary btn-sm"
                          style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff', padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          🔄 Khôi phục
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setStandardForm({
                                id: s.id,
                                standardCode: s.standardCode,
                                standardName: s.standardName,
                                description: s.description || '',
                                status: s.status,
                                approvalStatus: s.approvalStatus
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
                              onClick={() => handleDelete(s.id, `Bạn muốn xóa tiêu chuẩn ${s.standardName}?`)}
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
              ))
            )}
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
                {standardForm.id ? '📝 Sửa tiêu chuẩn kỹ thuật' : '➕ Thêm tiêu chuẩn kỹ thuật'}
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
                  const isReadOnly = !!standardForm.id && (standardForm.approvalStatus === 'APPROVED' || standardForm.status === 'ACTIVE');
                  return (
                    <>
                      <div className="form-group">
                        <label>Mã tiêu chuẩn <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input
                          type="text"
                          className="input"
                          required
                          value={standardForm.standardCode}
                          onChange={(e) => setStandardForm({ ...standardForm, standardCode: e.target.value })}
                          placeholder="Ví dụ: ISO 9001, TCVN"
                          disabled={isReadOnly}
                          style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tên tiêu chuẩn <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input
                          type="text"
                          className="input"
                          required
                          value={standardForm.standardName}
                          onChange={(e) => setStandardForm({ ...standardForm, standardName: e.target.value })}
                          placeholder="Ví dụ: Tiêu chuẩn Quản lý Chất lượng"
                          disabled={isReadOnly}
                          style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                        />
                      </div>

                      <div className="form-group">
                        <label>Mô tả tiêu chuẩn</label>
                        <textarea
                          className="input"
                          rows={3}
                          value={standardForm.description}
                          onChange={(e) => setStandardForm({ ...standardForm, description: e.target.value })}
                          placeholder="Mô tả nội dung tiêu chuẩn..."
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
                    value={standardForm.status}
                    onChange={(e) => setStandardForm({ ...standardForm, status: e.target.value })}
                    disabled={standardForm.approvalStatus !== 'APPROVED' || !isAuthorizedToApprove}
                    style={standardForm.approvalStatus !== 'APPROVED' || !isAuthorizedToApprove ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                  >
                    <option value="INACTIVE">Ngừng hoạt động</option>
                    {standardForm.approvalStatus === 'APPROVED' && (
                      <option value="ACTIVE">Hoạt động</option>
                    )}
                  </select>
                  {standardForm.approvalStatus !== 'APPROVED' && (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                      ⚠️ Chỉ có thể kích hoạt hoạt động sau khi tiêu chuẩn đã được phê duyệt.
                    </span>
                  )}
                  {!isAuthorizedToApprove && (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                      ⚠️ Chỉ Quản lý hoặc Admin mới có quyền chỉnh sửa trạng thái hoạt động.
                    </span>
                  )}
                </div>

                {standardForm.id ? (
                  <div className="form-group">
                    <label>Trạng thái phê duyệt</label>
                    {isAuthorizedToApprove ? (
                      <select
                        className="input"
                        value={standardForm.approvalStatus}
                        onChange={(e) => setStandardForm({ ...standardForm, approvalStatus: e.target.value })}
                        disabled={standardForm.status === 'ACTIVE'}
                        style={standardForm.status === 'ACTIVE' ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
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
                          standardForm.approvalStatus === 'APPROVED' ? 'Đã duyệt' :
                            standardForm.approvalStatus === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'
                        }
                        disabled
                        style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                      />
                    )}
                    {standardForm.status === 'ACTIVE' && (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                        ⚠️ Cần chuyển trạng thái hoạt động về 'Ngừng hoạt động' trước khi thay đổi trạng thái phê duyệt.
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Trạng thái phê duyệt mặc định</label>
                    <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-hover)', borderRadius: '6px', color: 'var(--warning)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      ⏳ Chờ duyệt (Tiêu chuẩn mới tạo sẽ cần Quản lý hoặc Admin phê duyệt)
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end', backgroundColor: 'var(--bg-hover)' }}>
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="btn btn-secondary" style={{ minWidth: '100px' }}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }}>{standardForm.id ? 'Cập nhật' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for View Details */}
      {viewingStandard && (
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
          onClick={() => setViewingStandard(null)}
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
                👁️ Chi tiết tiêu chuẩn kỹ thuật
              </h3>
              <button
                type="button"
                onClick={() => setViewingStandard(null)}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Mã tiêu chuẩn</label>
                  <strong style={{ fontSize: '15px' }}>{viewingStandard.standardCode}</strong>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Tên tiêu chuẩn</label>
                  <strong style={{ fontSize: '15px' }}>{viewingStandard.standardName}</strong>
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
                  {viewingStandard.description || 'Không có mô tả.'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Trạng thái hoạt động</label>
                  <span className={`badge ${viewingStandard.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '12px', padding: '6px 12px' }}>
                    {viewingStandard.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'}
                  </span>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Trạng thái phê duyệt</label>
                  <span className={`badge ${viewingStandard.approvalStatus === 'APPROVED' ? 'badge-success' :
                    viewingStandard.approvalStatus === 'PENDING' ? 'badge-warning' : 'badge-danger'
                    }`} style={{ fontSize: '12px', padding: '6px 12px' }}>
                    {
                      viewingStandard.approvalStatus === 'APPROVED' ? 'Đã duyệt' :
                        viewingStandard.approvalStatus === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'
                    }
                  </span>
                </div>
              </div>

              {viewingStandard.createdAt && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Thời gian tạo</label>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(viewingStandard.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  {viewingStandard.updatedAt && (
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Cập nhật lần cuối</label>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(viewingStandard.updatedAt).toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)' }}>
              <button type="button" onClick={() => setViewingStandard(null)} className="btn btn-primary" style={{ minWidth: '100px' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
