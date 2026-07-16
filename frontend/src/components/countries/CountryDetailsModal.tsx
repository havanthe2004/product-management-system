interface CountryDetailsModalProps {
  viewingCountry: any;
  onClose: () => void;
}

export default function CountryDetailsModal({ viewingCountry, onClose }: CountryDetailsModalProps) {
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
            👁️ Chi tiết nước hợp tác
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

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Mã ISO quốc gia</label>
              <strong style={{ fontSize: '15px' }}>{viewingCountry.isoCode}</strong>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Tên nước hợp tác</label>
              <strong style={{ fontSize: '15px' }}>{viewingCountry.countryName}</strong>
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
              {viewingCountry.description || 'Không có mô tả.'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Trạng thái hoạt động</label>
              <span className={`badge ${viewingCountry.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '12px', padding: '6px 12px' }}>
                {viewingCountry.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'}
              </span>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Trạng thái phê duyệt</label>
              <span className={`badge ${viewingCountry.approvalStatus === 'APPROVED' ? 'badge-success' :
                viewingCountry.approvalStatus === 'PENDING' ? 'badge-warning' : 'badge-danger'
                }`} style={{ fontSize: '12px', padding: '6px 12px' }}>
                {
                  viewingCountry.approvalStatus === 'APPROVED' ? 'Đã duyệt' :
                    viewingCountry.approvalStatus === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'
                }
              </span>
            </div>
          </div>

          {viewingCountry.createdAt && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Thời gian tạo</label>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(viewingCountry.createdAt).toLocaleString('vi-VN')}</span>
              </div>
              {viewingCountry.updatedAt && (
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Cập nhật lần cuối</label>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(viewingCountry.updatedAt).toLocaleString('vi-VN')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)' }}>
          <button type="button" onClick={onClose} className="btn btn-primary" style={{ minWidth: '100px' }}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
