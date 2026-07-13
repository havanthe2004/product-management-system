import { useAppSelector } from '../store/hooks';
import { ProductStatus } from '../store/slices/productsSlice';

export default function OverviewTab() {
  const products = useAppSelector((state) => state.products);

  const stats = {
    total: products.list.length,
    approved: products.list.filter(p => p.status === ProductStatus.APPROVED).length,
    pending: products.list.filter(p => p.status === ProductStatus.PENDING).length,
    rejected: products.list.filter(p => p.status === ProductStatus.REJECTED).length,
  };

  return (
    <div className="fade-in">
      {/* Overview Intro */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>👋 Chào mừng quay trở lại!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          Dưới đây là tóm tắt số liệu hoạt động của hệ thống hàng hóa. Bạn có thể theo dõi tiến trình kiểm duyệt và báo cáo nhanh tại bảng điều khiển này.
        </p>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '32px' }}>📦</div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Tổng số sản phẩm</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>{stats.total}</h3>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '32px' }}>🟢</div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Đã phê duyệt</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)', margin: 0 }}>{stats.approved}</h3>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '32px' }}>🟡</div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Chờ duyệt</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--warning)', margin: 0 }}>{stats.pending}</h3>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '32px' }}>🔴</div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Bị từ chối</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--danger)', margin: 0 }}>{stats.rejected}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
