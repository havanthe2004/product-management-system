import type { Commodity } from '../../types';
import { getProductImageUrl } from '../../utils/productUtils';

interface ProductDetailsModalProps {
  product: Commodity;
  onClose: () => void;
}

export default function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
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
          maxWidth: '650px',
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
            👁️ Chi tiết sản phẩm mặt hàng
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

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Product Info Summary */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <img
              src={getProductImageUrl(product.imageUrl)}
              alt={product.commodityName}
              style={{ width: '120px', height: '120px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)' }}
              onError={(e) => { (e.target as HTMLImageElement).src = '/image.png'; }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--text-main)' }}>{product.commodityName}</h2>
              <div>Mã HS sản phẩm: <code style={{ fontSize: '14px', fontWeight: '700' }}>{product.commodityCode}</code></div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <span className={`badge ${product.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '11px', padding: '4px 8px' }}>
                  {product.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'}
                </span>
                <span className={`badge ${product.approvalStatus === 'APPROVED' ? 'badge-success' :
                  product.approvalStatus === 'PENDING' ? 'badge-warning' : 'badge-danger'
                  }`} style={{ fontSize: '11px', padding: '4px 8px' }}>
                  {product.approvalStatus === 'APPROVED' ? 'Đã duyệt' :
                    product.approvalStatus === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'}
                </span>
              </div>
            </div>
          </div>

          {/* Catalog Categories info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Nhóm mặt hàng</label>
              <strong style={{ fontSize: '14px' }}>{product.group?.groupName || '-'}</strong>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Loại mặt hàng</label>
              <strong style={{ fontSize: '14px' }}>{product.type?.typeName || '-'}</strong>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Đơn vị đo lường</label>
              <strong style={{ fontSize: '14px' }}>{product.unit?.unitName} ({product.unit?.symbol})</strong>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Mô tả sản phẩm</label>
            <div style={{
              backgroundColor: 'var(--bg-hover)',
              padding: '12px 16px',
              borderRadius: '8px',
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              color: 'var(--text-main)',
              lineHeight: '1.6',
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid var(--border-color)'
            }}>
              {product.description || 'Không có mô tả chi tiết cho mặt hàng này.'}
            </div>
          </div>

          {/* Junction relationships lists */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', paddingTop: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>🌎 Quốc gia đối tác nhập khẩu</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(product.countries || []).length > 0 ? (
                  (product.countries || []).map(c => (
                    <span key={c.id} style={{ fontSize: '12px', padding: '3px 8px', backgroundColor: 'var(--bg-hover)', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: '500' }}>
                      {c.countryName} ({c.isoCode})
                    </span>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Không có nước đối tác nào được liên kết.</span>
                )}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>🛡️ Tiêu chuẩn chất lượng áp dụng</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(product.qualityStandards || []).length > 0 ? (
                  (product.qualityStandards || []).map(qs => (
                    <span key={qs.id} className="badge badge-success" style={{ fontSize: '11px', padding: '3px 8px' }}>
                      {qs.standardName} ({qs.standardCode})
                    </span>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Không có tiêu chuẩn chất lượng.</span>
                )}
              </div>
            </div>
          </div>

          {/* Metadata log creators */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>👤 Người tạo: <strong>{product.createdBy?.fullName || product.createdBy?.email || 'Hệ thống'}</strong></div>
              {product.createdAt && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thời gian tạo: {new Date(product.createdAt).toLocaleString('vi-VN')}</div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>👤 Cập nhật cuối: <strong>{product.updatedBy?.fullName || product.updatedBy?.email || 'Hệ thống'}</strong></div>
              {product.updatedAt && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thời gian sửa: {new Date(product.updatedAt).toLocaleString('vi-VN')}</div>
              )}
            </div>
          </div>

          {/* Approval metadata logs */}
          {product.approvalStatus === 'APPROVED' && product.approvedBy && (
            <div style={{ backgroundColor: 'var(--bg-hover)', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border-color)', marginTop: '8px' }}>
              <span>🔒 Phê duyệt bởi: <strong>{product.approvedBy?.fullName || product.approvedBy?.email}</strong></span>
              {product.approvedAt && (
                <span style={{ color: 'var(--text-muted)' }}>Thời gian duyệt: {new Date(product.approvedAt).toLocaleString('vi-VN')}</span>
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
