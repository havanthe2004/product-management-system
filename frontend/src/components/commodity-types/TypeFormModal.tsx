import React from 'react';

interface TypeFormModalProps {
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  typeForm: any;
  setTypeForm: React.Dispatch<React.SetStateAction<any>>;
  groups: any[];
  isAuthorizedToApprove: boolean;
}

export default function TypeFormModal({
  onClose,
  onSave,
  typeForm,
  setTypeForm,
  groups,
  isAuthorizedToApprove,
}: TypeFormModalProps) {
  const isReadOnly = !!typeForm.id && (typeForm.approvalStatus === 'APPROVED' || typeForm.status === 'ACTIVE');

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
            {typeForm.id ? '📝 Sửa loại mặt hàng' : '➕ Thêm loại mặt hàng'}
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
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ minWidth: '100px' }}>Hủy</button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }}>{typeForm.id ? 'Cập nhật' : 'Thêm mới'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
