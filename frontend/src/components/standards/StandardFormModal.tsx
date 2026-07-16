import React from 'react';

interface StandardFormModalProps {
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  standardForm: any;
  setStandardForm: React.Dispatch<React.SetStateAction<any>>;
  isAuthorizedToApprove: boolean;
}

export default function StandardFormModal({
  onClose,
  onSave,
  standardForm,
  setStandardForm,
  isAuthorizedToApprove,
}: StandardFormModalProps) {
  const isReadOnly = !!standardForm.id && (standardForm.approvalStatus === 'APPROVED' || standardForm.status === 'ACTIVE');

  return (
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
      onClick={onClose}
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
            onClick={onClose}
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
        <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', margin: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
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
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ minWidth: '100px' }}>Hủy</button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }}>{standardForm.id ? 'Cập nhật' : 'Thêm mới'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
