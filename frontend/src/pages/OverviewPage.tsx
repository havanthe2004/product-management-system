import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/catalog.service';

interface DashboardData {
  stats: {
    totalCommodities: number;
    activeCommodities: number;
    pendingCommodities: number;
    inactiveCommodities: number;
    totalGroups: number;
    totalTypes: number;
    totalCountries: number;
    totalStandards: number;
  };
  commoditiesByGroup: Array<{
    groupId: number;
    groupCode: string;
    groupName: string;
    count: number;
  }>;
  topCountries: Array<{
    countryId: number;
    countryName: string;
    isoCode: string;
    count: number;
  }>;
  topProductsByMarkets: Array<{
    id: number;
    commodityCode: string;
    commodityName: string;
    type: { typeName: string } | null;
    group: { groupName: string } | null;
    countries: Array<{ countryName: string }>;
  }>;
}

export default function OverviewPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Tooltip/hover states
  const [hoveredGroupId, setHoveredGroupId] = useState<number | null>(null);
  const [hoveredCountryId, setHoveredCountryId] = useState<number | null>(null);
  const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    getDashboardStats()
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .catch((err) => console.error('Failed to load overview data from Backend:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="fade-in">
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .skeleton-pulse {
            background: linear-gradient(90deg, var(--bg-card) 25%, var(--border-color) 50%, var(--bg-card) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
          }
        `}</style>
        {/* Banner Skeleton */}
        <div className="skeleton-pulse" style={{ height: '110px', marginBottom: '24px', width: '100%' }} />
        
        {/* Cards Skeleton */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-pulse" style={{ height: '90px' }} />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div className="skeleton-pulse" style={{ height: '350px' }} />
          <div className="skeleton-pulse" style={{ height: '350px' }} />
        </div>
      </div>
    );
  }

  const { stats, commoditiesByGroup, topCountries, topProductsByMarkets } = data;
  const maxGroupCount = Math.max(...commoditiesByGroup.map(g => g.count), 1);
  const maxCountryCount = Math.max(...topCountries.map(c => c.count), 1);

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      <style>{`
        @keyframes growUp {
          from { height: 0; }
          to { height: 100%; }
        }
        .bar-grow {
          animation: growUp 1.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .stat-card-glow:hover {
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.15);
          transform: translateY(-2px);
        }
      `}</style>

      {/* Overview Intro */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>👋 Chào mừng quay trở lại!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Tất cả dữ liệu phân tích và biểu đồ dưới đây đã được **xử lý và tính toán trực tiếp từ Backend** dựa trên sản phẩm đang hoạt động.
          </p>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', borderLeft: '2px solid var(--border-color)', paddingLeft: '16px' }}>
          Cập nhật mới nhất: {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>

      {/* Grid 8 Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Card 1: Tổng mặt hàng */}
        <div className="card stat-card-glow" style={{ display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s' }}>
          <div style={{ fontSize: '32px', padding: '10px', backgroundColor: 'var(--primary-light)', borderRadius: '12px' }}>📦</div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Tổng mặt hàng</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>{stats.totalCommodities}</h3>
          </div>
        </div>

        {/* Card 2: Đang hoạt động */}
        <div className="card stat-card-glow" style={{ display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s' }}>
          <div style={{ fontSize: '32px', padding: '10px', backgroundColor: 'var(--success-light)', borderRadius: '12px' }}>⚡</div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Đang hoạt động</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)', margin: 0 }}>{stats.activeCommodities}</h3>
          </div>
        </div>

        {/* Card 3: Chờ duyệt */}
        <div className="card stat-card-glow" style={{ display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s' }}>
          <div style={{ fontSize: '32px', padding: '10px', backgroundColor: 'var(--warning-light)', borderRadius: '12px' }}>⏳</div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Chờ duyệt</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--warning)', margin: 0 }}>{stats.pendingCommodities}</h3>
          </div>
        </div>

        {/* Card 4: Ngừng hoạt động */}
        <div className="card stat-card-glow" style={{ display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s' }}>
          <div style={{ fontSize: '32px', padding: '10px', backgroundColor: 'var(--danger-light)', borderRadius: '12px' }}>🚫</div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Ngừng hoạt động</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--danger)', margin: 0 }}>{stats.inactiveCommodities}</h3>
          </div>
        </div>

        {/* Card 5: Nhóm hàng */}
        <div className="card stat-card-glow" style={{ display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s' }}>
          <div style={{ fontSize: '32px', padding: '10px', backgroundColor: 'var(--primary-light)', borderRadius: '12px' }}>📁</div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Nhóm hàng</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)', margin: 0 }}>{stats.totalGroups}</h3>
          </div>
        </div>

        {/* Card 6: Loại hàng */}
        <div className="card stat-card-glow" style={{ display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s' }}>
          <div style={{ fontSize: '32px', padding: '10px', backgroundColor: 'var(--primary-light)', borderRadius: '12px' }}>📂</div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Loại hàng</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)', margin: 0 }}>{stats.totalTypes}</h3>
          </div>
        </div>

        {/* Card 7: Quốc gia */}
        <div className="card stat-card-glow" style={{ display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s' }}>
          <div style={{ fontSize: '32px', padding: '10px', backgroundColor: 'var(--primary-light)', borderRadius: '12px' }}>🌍</div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Quốc gia đối tác</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)', margin: 0 }}>{stats.totalCountries}</h3>
          </div>
        </div>

        {/* Card 8: Tiêu chuẩn */}
        <div className="card stat-card-glow" style={{ display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s' }}>
          <div style={{ fontSize: '32px', padding: '10px', backgroundColor: 'var(--primary-light)', borderRadius: '12px' }}>🛡️</div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Tiêu chuẩn kỹ thuật</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)', margin: 0 }}>{stats.totalStandards}</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Chart 1: Commodities by Group (Vertical Bars) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '390px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 Số lượng mặt hàng hoạt động theo nhóm hàng
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            flex: 1,
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border-color)',
            overflowX: 'auto',
            gap: '12px'
          }}>
            {commoditiesByGroup.map((g) => {
              const heightPct = (g.count / maxGroupCount) * 80;
              return (
                <div
                  key={g.groupId}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    flex: 1,
                    minWidth: '45px',
                    maxWidth: '80px'
                  }}
                  onMouseEnter={() => setHoveredGroupId(g.groupId)}
                  onMouseLeave={() => setHoveredGroupId(null)}
                >
                  {/* Tooltip */}
                  {hoveredGroupId === g.groupId && (
                    <div style={{
                      position: 'absolute',
                      bottom: `calc(${heightPct}% + 45px)`,
                      backgroundColor: '#1E293B',
                      color: '#FFF',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      zIndex: 50,
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                      pointerEvents: 'none',
                      border: '1px solid var(--border-color)'
                    }}>
                      <strong style={{ color: 'var(--primary)' }}>{g.groupName}</strong>
                      <div style={{ marginTop: '2px', fontWeight: 'normal' }}>Hoạt động: {g.count} sản phẩm</div>
                    </div>
                  )}

                  {/* Count Label */}
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {g.count}
                  </span>

                  {/* Vertical Bar */}
                  <div
                    className="bar-grow"
                    style={{
                      width: '24px',
                      height: `${heightPct}%`,
                      minHeight: g.count > 0 ? '4px' : '0px',
                      background: hoveredGroupId === g.groupId
                        ? 'linear-gradient(180deg, var(--primary-hover) 0%, rgba(99, 102, 241, 0.6) 100%)'
                        : 'linear-gradient(180deg, var(--primary) 0%, rgba(99, 102, 241, 0.2) 100%)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 0.2s ease',
                      boxShadow: hoveredGroupId === g.groupId ? 'var(--shadow-glow)' : 'none',
                      cursor: 'pointer'
                    }}
                  />

                  {/* Label (Code) */}
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      marginTop: '8px',
                      fontWeight: '600',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%'
                    }}
                    title={g.groupName}
                  >
                    {g.groupCode}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Top 10 Countries by ACTIVE Commodities (Vertical Bars) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '390px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🌍 Top 10 thị trường xuất khẩu sản phẩm hoạt động
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            flex: 1,
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border-color)',
            overflowX: 'auto',
            gap: '12px'
          }}>
            {topCountries.length === 0 ? (
              <div style={{ display: 'flex', flex: 1, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Chưa có dữ liệu thị trường xuất khẩu
              </div>
            ) : (
              topCountries.map((c) => {
                const heightPct = (c.count / maxCountryCount) * 80;
                return (
                  <div
                    key={c.countryId}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      flex: 1,
                      minWidth: '45px',
                      maxWidth: '80px'
                    }}
                    onMouseEnter={() => setHoveredCountryId(c.countryId)}
                    onMouseLeave={() => setHoveredCountryId(null)}
                  >
                    {/* Tooltip */}
                    {hoveredCountryId === c.countryId && (
                      <div style={{
                        position: 'absolute',
                        bottom: `calc(${heightPct}% + 45px)`,
                        backgroundColor: '#1E293B',
                        color: '#FFF',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        zIndex: 50,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                        pointerEvents: 'none',
                        border: '1px solid var(--border-color)'
                      }}>
                        <strong style={{ color: 'var(--success)' }}>{c.countryName}</strong>
                        <div style={{ marginTop: '2px', fontWeight: 'normal' }}>Mặt hàng hoạt động: {c.count}</div>
                      </div>
                    )}

                    {/* Count Label */}
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {c.count}
                    </span>

                    {/* Vertical Bar */}
                    <div
                      className="bar-grow"
                      style={{
                        width: '24px',
                        height: `${heightPct}%`,
                        minHeight: c.count > 0 ? '4px' : '0px',
                        background: hoveredCountryId === c.countryId
                          ? 'linear-gradient(180deg, #059669 0%, rgba(16, 185, 129, 0.6) 100%)'
                          : 'linear-gradient(180deg, var(--success) 0%, rgba(16, 185, 129, 0.2) 100%)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'all 0.2s ease',
                        boxShadow: hoveredCountryId === c.countryId ? '0 0 12px rgba(16, 185, 129, 0.3)' : 'none',
                        cursor: 'pointer'
                      }}
                    />

                    {/* Label (ISO Code) */}
                    <span
                      style={{
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                        marginTop: '8px',
                        fontWeight: '700',
                        textAlign: 'center',
                        textTransform: 'uppercase'
                      }}
                      title={c.countryName}
                    >
                      {c.isoCode}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Top 10 Products with Most Export Markets (Table) */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          👑 Top 10 sản phẩm hoạt động có nhiều thị trường xuất khẩu nhất
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', width: '80px' }}>Hạng</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Tên sản phẩm</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Mã sản phẩm</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Nhóm hàng</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>Số lượng thị trường</th>
              </tr>
            </thead>
            <tbody>
              {topProductsByMarkets.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Chưa có dữ liệu sản phẩm đang hoạt động
                  </td>
                </tr>
              ) : (
                topProductsByMarkets.map((p, index) => {
                  const numCountries = p.countries?.length || 0;
                  const countryList = p.countries?.map(ct => ct.countryName).join(', ') || 'Không có';
                  
                  // Rank badge colors
                  const isTop3 = index < 3;
                  const rankColors = [
                    { bg: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)', text: '#FFFFFF', icon: '👑' }, // Gold
                    { bg: 'linear-gradient(135deg, #9CA3AF 0%, #4B5563 100%)', text: '#FFFFFF', icon: '🥈' }, // Silver
                    { bg: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)', text: '#FFFFFF', icon: '🥉' }  // Bronze
                  ];
                  const defaultRankStyle = {
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)'
                  };

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background-color 0.2s',
                        backgroundColor: hoveredProductId === p.id ? 'var(--bg-hover)' : 'transparent'
                      }}
                      onMouseEnter={() => setHoveredProductId(p.id)}
                      onMouseLeave={() => setHoveredProductId(null)}
                    >
                      {/* Rank Badge */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          fontSize: '12px',
                          fontWeight: '700',
                          ...(isTop3 ? { background: rankColors[index].bg, color: rankColors[index].text } : defaultRankStyle)
                        }}>
                          {isTop3 ? rankColors[index].icon : index + 1}
                        </div>
                      </td>

                      {/* Product Name */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{p.commodityName}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.type?.typeName || 'Loại hàng'}</span>
                        </div>
                      </td>

                      {/* Code */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontFamily: 'monospace', padding: '4px 8px', backgroundColor: 'var(--bg-hover)', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-primary)' }}>
                          {p.commodityCode}
                        </span>
                      </td>

                      {/* Group */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {p.group?.groupName || 'Nhóm hàng'}
                        </span>
                      </td>

                      {/* Export Countries Count */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            cursor: 'help'
                          }}
                          title={countryList}
                        >
                          <span style={{ fontWeight: '700', color: 'var(--success)', fontSize: '14px' }}>
                            {numCountries} <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>quốc gia</span>
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              color: 'var(--text-muted)',
                              maxWidth: '180px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {countryList}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
