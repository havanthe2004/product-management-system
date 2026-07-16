import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import { UserRole } from '../store/slices/authSlice';
import {
  getCommodities,
  getCommodityGroups,
  getCommodityTypes,
  getUnits,
  getCountries,
  getQualityStandards,
  saveCatalog,
  deleteCatalog,
  getTrashCatalog,
  restoreCatalog
} from '../services/catalog.service';
import type { Commodity, CommodityGroup, CommodityType, Country, QualityStandard, Unit } from '../types';

export default function ProductsTab() {
  const [dbProducts, setDbProducts] = useState<Commodity[]>([]);
  const [categories, setCategories] = useState<CommodityGroup[]>([]);
  const [types, setTypes] = useState<CommodityType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [standards, setStandards] = useState<QualityStandard[]>([]);

  // Search & Filters State (Separated filters)
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [approvalFilter, setApprovalFilter] = useState('ALL');

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashView, setIsTrashView] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Commodity | null>(null);

  const auth = useAppSelector((state) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userRole = auth.user?.role;
  const isAuthorizedToApprove = userRole === 'ADMIN' || userRole === 'MANAGER';

  // Load catalogs & commodities
  const fetchCatalogs = async () => {
    try {
      const [resCat, resType, resUnit, resCountry, resStandard] = await Promise.all([
        getCommodityGroups(),
        getCommodityTypes(),
        getUnits(),
        getCountries(),
        getQualityStandards()
      ]);
      if (resCat.success) setCategories(resCat.data.filter(c => c.status === 'ACTIVE' && c.approvalStatus === 'APPROVED'));
      if (resType.success) setTypes(resType.data.filter(t => t.status === 'ACTIVE' && t.approvalStatus === 'APPROVED'));
      if (resUnit.success) setUnits(resUnit.data.filter(u => u.status === 'ACTIVE' && u.approvalStatus === 'APPROVED'));
      if (resCountry.success) setCountries(resCountry.data.filter(c => c.status === 'ACTIVE' && c.approvalStatus === 'APPROVED'));
      if (resStandard.success) setStandards(resStandard.data.filter(s => s.status === 'ACTIVE' && s.approvalStatus === 'APPROVED'));
    } catch (err) {
      console.error('Lỗi tải danh mục cấu hình:', err);
    }
  };

  const fetchCommodities = async () => {
    try {
      const res = isTrashView
        ? await getTrashCatalog('commodities')
        : await getCommodities();
      if (res.success) {
        setDbProducts(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách mặt hàng:', err);
    }
  };

  useEffect(() => {
    fetchCatalogs();
  }, []);

  useEffect(() => {
    fetchCommodities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrashView]);

  // Form State (Added itemCode for the custom part of the HS Code)
  const [form, setForm] = useState({
    id: null as any,
    commodityCode: '',
    commodityName: '',
    itemCode: '',
    imageUrl: '',
    groupId: '',
    typeId: '',
    unitId: '',
    description: '',
    status: 'INACTIVE',
    approvalStatus: 'PENDING',
    countryIds: [] as number[],
    qualityStandardIds: [] as number[]
  });

  const resetForm = () => {
    setForm({
      id: null,
      commodityCode: '',
      commodityName: '',
      itemCode: '',
      imageUrl: '',
      groupId: categories[0]?.id ? String(categories[0].id) : '',
      typeId: '',
      unitId: units[0]?.id ? String(units[0].id) : '',
      description: '',
      status: 'INACTIVE',
      approvalStatus: 'PENDING',
      countryIds: [],
      qualityStandardIds: []
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filter types dropdown based on selected group in Form
  const filteredTypesForForm = form.groupId
    ? types.filter((t) => Number(t.groupId || t.group?.id) === Number(form.groupId))
    : [];

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Commodity) => {
    // Extract the suffix part from commodityCode (split by dot and get the last part)
    const codeParts = item.commodityCode.split('.');
    const suffix = codeParts.length >= 3 ? codeParts.slice(2).join('.') : item.commodityCode;

    setForm({
      id: item.id,
      commodityCode: item.commodityCode,
      commodityName: item.commodityName,
      itemCode: suffix,
      imageUrl: item.imageUrl || '',
      groupId: item.group?.id ? String(item.group.id) : '',
      typeId: item.type?.id ? String(item.type.id) : '',
      unitId: item.unit?.id ? String(item.unit.id) : '',
      description: item.description || '',
      status: item.status,
      approvalStatus: item.approvalStatus,
      countryIds: (item.countries || []).map(c => Number(c.id)),
      qualityStandardIds: (item.qualityStandards || []).map(s => Number(s.id))
    });
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.groupId || !form.typeId || !form.unitId || !form.itemCode) {
      alert('Vui lòng chọn Nhóm mặt hàng, Loại mặt hàng, Đơn vị tính và nhập mã hàng.');
      return;
    }

    const selGroup = categories.find(c => Number(c.id) === Number(form.groupId));
    const selType = types.find(t => Number(t.id) === Number(form.typeId));
    if (!selGroup || !selType) {
      alert('Không tìm thấy thông tin nhóm hoặc loại sản phẩm đã chọn.');
      return;
    }

    // Combine code: groupCode + '.' + typeCode + '.' + itemCode
    const finalCode = `${selGroup.groupCode}.${selType.typeCode}.${form.itemCode}`;

    try {
      const dataToSave = {
        ...form,
        commodityCode: finalCode,
        groupId: Number(form.groupId),
        typeId: Number(form.typeId),
        unitId: Number(form.unitId),
        countryIds: form.countryIds,
        qualityStandardIds: form.qualityStandardIds
      };

      await saveCatalog('commodities', dataToSave);
      resetForm();
      setIsModalOpen(false);
      fetchCommodities();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (item: Commodity, approveStatus: 'APPROVED' | 'REJECTED') => {
    const actionText = approveStatus === 'APPROVED' ? 'phê duyệt' : 'từ chối';
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} mặt hàng "${item.commodityName}"?`)) return;

    try {
      await saveCatalog('commodities', {
        ...item,
        groupId: item.group.id,
        typeId: item.type.id,
        unitId: item.unit.id,
        countryIds: (item.countries || []).map(c => c.id),
        qualityStandardIds: (item.qualityStandards || []).map(s => s.id),
        approvalStatus: approveStatus
      });
      fetchCommodities();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mặt hàng "${name}"?`)) return;

    try {
      await deleteCatalog('commodities', id);
      fetchCommodities();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRestore = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn khôi phục mặt hàng "${name}"?`)) return;

    try {
      await restoreCatalog('commodities', id);
      fetchCommodities();
    } catch (err: any) {
      alert('Lỗi khôi phục: ' + (err.response?.data?.message || err.message));
    }
  };

  const hostUrl = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
    : 'http://localhost:5000';

  const getProductImageUrl = (url: string | undefined | null) => {
    if (!url) return '/image.png';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${hostUrl}${url}`;
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Client filtering using separated filters
  const filteredProducts = dbProducts.filter((product) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      product.commodityName.toLowerCase().includes(searchLower) ||
      product.commodityCode.toLowerCase().includes(searchLower) ||
      (product.description || '').toLowerCase().includes(searchLower);

    const matchesGroup =
      groupFilter === 'ALL' ||
      Number(product.group?.id) === Number(groupFilter);

    const matchesType =
      typeFilter === 'ALL' ||
      Number(product.type?.id) === Number(typeFilter);

    const matchesActive =
      activeFilter === 'ALL' ||
      product.status === activeFilter;

    const matchesApproval =
      approvalFilter === 'ALL' ||
      product.approvalStatus === approvalFilter;

    return matchesSearch && matchesGroup && matchesType && matchesActive && matchesApproval;
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
          {isTrashView ? '🗑️ Thùng rác danh mục mặt hàng' : 'Danh mục mặt hàng'}
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
              onClick={handleOpenAddModal}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              ➕ Thêm hàng hóa mới
            </button>
          )}
        </div>
      </div>

      {/* Filter Row Card with separated filters */}
      {!isTrashView && (
        <div className="card" style={{ marginBottom: '4px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                placeholder="🔍 Tìm kiếm theo tên, mã sản phẩm hoặc mô tả..."
                className="input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ width: '160px' }}>
              <select
                className="input"
                value={groupFilter}
                onChange={(e) => {
                  setGroupFilter(e.target.value);
                  setTypeFilter('ALL'); // Reset type filter on group filter change
                }}
              >
                <option value="ALL">Tất cả nhóm</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.groupName}</option>
                ))}
              </select>
            </div>

            <div style={{ width: '160px' }}>
              <select
                className="input"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                disabled={groupFilter === 'ALL'}
              >
                <option value="ALL">Tất cả loại</option>
                {types
                  .filter((t) => groupFilter === 'ALL' || Number(t.groupId || t.group?.id) === Number(groupFilter))
                  .map((t) => (
                    <option key={t.id} value={t.id}>{t.typeName}</option>
                  ))}
              </select>
            </div>

            <div style={{ width: '160px' }}>
              <select
                className="input"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="ALL">Tất cả hoạt động</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngừng hoạt động</option>
              </select>
            </div>

            <div style={{ width: '160px' }}>
              <select
                className="input"
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
              >
                <option value="ALL">Tất cả phê duyệt</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Products Table Card */}
      <div className="table-container" style={{ alignSelf: 'stretch', overflowX: 'auto', boxShadow: 'var(--shadow-sm)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ width: '20%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Mặt hàng</th>
              <th style={{ width: '14%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Mã HS</th>
              <th style={{ width: '14%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Phân loại & ĐVT</th>
              <th style={{ width: '10%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Nước đối tác</th>
              <th style={{ width: '14%', padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Tiêu chuẩn</th>
              <th style={{ width: '8%', padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Hoạt động</th>
              <th style={{ width: '8%', padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Phê duyệt</th>
              <th style={{ width: '12%', padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: 'var(--text-secondary)' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  📭 Không tìm thấy mặt hàng nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredProducts.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={getProductImageUrl(item.imageUrl)}
                        alt={item.commodityName}
                        style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/image.png'; }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span
                          onClick={() => setViewingProduct(item)}
                          style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600', transition: 'color 0.15s' }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          title="Xem chi tiết"
                        >
                          {item.commodityName}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }} title={item.description}>
                          {truncateText(item.description || '', 35)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <code>{item.commodityCode}</code>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                      <div>Nhóm: <span className="badge badge-primary">{item.group?.groupName || 'N/A'}</span></div>
                      <div>Loại: <strong style={{ color: 'var(--text-main)' }}>{item.type?.typeName || 'N/A'}</strong></div>
                      <div>ĐVT: <code style={{ color: 'var(--text-secondary)' }}>{item.unit?.symbol}</code></div>
                    </div>
                  </td>
                  {/* Separated Partner Countries Column */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                      {(item.countries || []).length > 0 ? (
                        <>
                          {(item.countries || []).slice(0, 2).map(c => (
                            <span key={c.id} style={{ fontSize: '12px', padding: '2px 6px', backgroundColor: 'var(--bg-hover)', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'inline-block' }}>
                              {c.countryName} ({c.isoCode})
                            </span>
                          ))}
                          {(item.countries || []).length > 2 && (
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }} title="Và các nước khác...">...</span>
                          )}
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>-</span>
                      )}
                    </div>
                  </td>
                  {/* Separated Quality Standards Column */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                      {(item.qualityStandards || []).length > 0 ? (
                        <>
                          {(item.qualityStandards || []).slice(0, 2).map(qs => (
                            <span key={qs.id} className="badge badge-success" style={{ fontSize: '9px', padding: '2px 5px' }}>
                              {qs.standardCode}
                            </span>
                          ))}
                          {(item.qualityStandards || []).length > 2 && (
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }} title="Và các tiêu chuẩn khác...">...</span>
                          )}
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>-</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span className={`badge ${item.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {item.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      {item.approvalStatus === 'PENDING' ? (
                        isAuthorizedToApprove && !isTrashView ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleApprove(item, 'APPROVED')}
                              className="btn btn-primary btn-sm"
                              style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)', color: '#fff', padding: '3px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Phê duyệt"
                            >
                              ✔️
                            </button>
                            <button
                              onClick={() => handleApprove(item, 'REJECTED')}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '3px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Từ chối"
                            >
                              ❌
                            </button>
                          </div>
                        ) : (
                          <span className="badge badge-warning">Chờ duyệt</span>
                        )
                      ) : (
                        <span className={`badge ${item.approvalStatus === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                          {item.approvalStatus === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                      {isTrashView ? (
                        <button
                          onClick={() => handleRestore(item.id, item.commodityName)}
                          className="btn btn-primary btn-sm"
                          style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff', padding: '4px 8px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Khôi phục"
                        >
                          🔄
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            disabled={
                              (item.approvalStatus === 'APPROVED' || item.status === 'ACTIVE') &&
                              userRole === UserRole.OFFICER
                            }
                            title="Chỉnh sửa"
                          >
                            ✏️
                          </button>
                          {isAuthorizedToApprove && (
                            <button
                              onClick={() => handleDelete(item.id, item.commodityName)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '4px 8px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Xóa"
                            >
                              🗑️
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

      {/* Add / Edit Modal */}
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
              maxWidth: '650px',
              maxHeight: '92vh',
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
                {form.id ? '📝 Sửa mặt hàng hàng hóa' : '➕ Thêm hàng hóa mới'}
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
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(() => {
                  const isReadOnly = !!form.id && (form.approvalStatus === 'APPROVED' || form.status === 'ACTIVE');
                  return (
                    <>
                      {/* Dropdown selectors row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                          <label>Nhóm mặt hàng <span style={{ color: 'var(--danger)' }}>*</span></label>
                          <select
                            className="input"
                            value={form.groupId}
                            onChange={(e) => setForm({ ...form, groupId: e.target.value, typeId: '' })}
                            disabled={isReadOnly}
                            style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', cursor: 'not-allowed' } : {}}
                          >
                            <option value="">-- Chọn Nhóm --</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.groupName} ({c.groupCode})</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Loại mặt hàng <span style={{ color: 'var(--danger)' }}>*</span></label>
                          <select
                            className="input"
                            value={form.typeId}
                            onChange={(e) => setForm({ ...form, typeId: e.target.value })}
                            disabled={isReadOnly || !form.groupId}
                            style={(isReadOnly || !form.groupId) ? { backgroundColor: 'var(--bg-hover)', cursor: 'not-allowed' } : {}}
                          >
                            <option value="">-- Chọn Loại --</option>
                            {filteredTypesForForm.map(t => (
                              <option key={t.id} value={t.id}>{t.typeName} ({t.typeCode})</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Đơn vị tính <span style={{ color: 'var(--danger)' }}>*</span></label>
                          <select
                            className="input"
                            value={form.unitId}
                            onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                            disabled={isReadOnly}
                            style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', cursor: 'not-allowed' } : {}}
                          >
                            <option value="">-- Chọn ĐVT --</option>
                            {units.map(u => (
                              <option key={u.id} value={u.id}>{u.unitName} ({u.symbol})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Code (custom part) & Name row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                          <label>Mã mặt hàng (Đuôi mã HS) <span style={{ color: 'var(--danger)' }}>*</span></label>
                          <input
                            type="text"
                            className="input"
                            required
                            value={form.itemCode}
                            onChange={(e) => setForm({ ...form, itemCode: e.target.value.trim().toUpperCase() })}
                            placeholder="Ví dụ: 001"
                            disabled={isReadOnly}
                            style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                          />
                          <div style={{ fontSize: '11px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                            <span>Mã HS dự kiến: </span>
                            <strong style={{ color: 'var(--primary)' }}>
                              {(() => {
                                const selGroup = categories.find(c => Number(c.id) === Number(form.groupId));
                                const selType = types.find(t => Number(t.id) === Number(form.typeId));
                                return `${selGroup?.groupCode || '????'}.${selType?.typeCode || '???'}.${form.itemCode || '???'}`;
                              })()}
                            </strong>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Tên mặt hàng <span style={{ color: 'var(--danger)' }}>*</span></label>
                          <input
                            type="text"
                            className="input"
                            required
                            value={form.commodityName}
                            onChange={(e) => setForm({ ...form, commodityName: e.target.value })}
                            placeholder="Ví dụ: Tai nghe Sony WH-1000XM5"
                            disabled={isReadOnly}
                            style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                          />
                        </div>
                      </div>

                      {/* Image section */}
                      <div className="form-group">
                        <label>Hình ảnh sản phẩm</label>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <img
                            src={getProductImageUrl(form.imageUrl)}
                            alt="Preview"
                            style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)' }}
                            onError={(e) => { (e.target as HTMLImageElement).src = '/image.png'; }}
                          />
                          {!isReadOnly && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                style={{ fontSize: '13px' }}
                              />
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Chọn tệp ảnh (.png, .jpg, .jpeg)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Junction list row (Countries & Standards) */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                          <label>Quốc gia đối tác</label>
                          <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: isReadOnly ? 'var(--bg-hover)' : 'transparent' }}>
                            {countries.length === 0 ? (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Không có quốc gia hoạt động.</span>
                            ) : (
                              countries.map(c => (
                                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isReadOnly ? 'not-allowed' : 'pointer', fontSize: '13px', margin: 0 }}>
                                  <input
                                    type="checkbox"
                                    disabled={isReadOnly}
                                    checked={form.countryIds.includes(c.id)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setForm(prev => ({
                                        ...prev,
                                        countryIds: checked ? [...prev.countryIds, c.id] : prev.countryIds.filter(id => id !== c.id)
                                      }));
                                    }}
                                  />
                                  <span>{c.countryName} ({c.isoCode})</span>
                                </label>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Tiêu chuẩn chất lượng</label>
                          <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: isReadOnly ? 'var(--bg-hover)' : 'transparent' }}>
                            {standards.length === 0 ? (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Không có tiêu chuẩn hoạt động.</span>
                            ) : (
                              standards.map(s => (
                                <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isReadOnly ? 'not-allowed' : 'pointer', fontSize: '13px', margin: 0 }}>
                                  <input
                                    type="checkbox"
                                    disabled={isReadOnly}
                                    checked={form.qualityStandardIds.includes(s.id)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setForm(prev => ({
                                        ...prev,
                                        qualityStandardIds: checked ? [...prev.qualityStandardIds, s.id] : prev.qualityStandardIds.filter(id => id !== s.id)
                                      }));
                                    }}
                                  />
                                  <span>{s.standardName} ({s.standardCode})</span>
                                </label>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="form-group">
                        <label>Mô tả chi tiết</label>
                        <textarea
                          className="input"
                          rows={3}
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          placeholder="Mô tả các thông số kỹ thuật, đặc điểm sản phẩm..."
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

                {/* Status and Approval Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div className="form-group">
                    <label>Trạng thái hoạt động</label>
                    <select
                      className="input"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      disabled={form.approvalStatus !== 'APPROVED' || !isAuthorizedToApprove}
                      style={form.approvalStatus !== 'APPROVED' || !isAuthorizedToApprove ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                    >
                      <option value="INACTIVE">Ngừng hoạt động</option>
                      {form.approvalStatus === 'APPROVED' && (
                        <option value="ACTIVE">Hoạt động</option>
                      )}
                    </select>
                    {form.approvalStatus !== 'APPROVED' && (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                        ⚠️ Cần có phê duyệt 'Đã duyệt' để kích hoạt.
                      </span>
                    )}
                    {!isAuthorizedToApprove && (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                        ⚠️ Yêu cầu Quản lý/Admin thay đổi hoạt động.
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Trạng thái phê duyệt</label>
                    {form.id ? (
                      isAuthorizedToApprove ? (
                        <select
                          className="input"
                          value={form.approvalStatus}
                          onChange={(e) => setForm({ ...form, approvalStatus: e.target.value })}
                          disabled={form.status === 'ACTIVE'}
                          style={form.status === 'ACTIVE' ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
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
                            form.approvalStatus === 'APPROVED' ? 'Đã duyệt' :
                              form.approvalStatus === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'
                          }
                          disabled
                          style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                        />
                      )
                    ) : (
                      <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-hover)', borderRadius: '6px', color: 'var(--warning)', fontWeight: '600', fontSize: '12px' }}>
                        ⏳ Chờ duyệt (Tạo mới cần phê duyệt)
                      </div>
                    )}
                    {form.status === 'ACTIVE' && (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                        ⚠️ Cần tắt trạng thái 'Hoạt động' trước khi thay đổi phê duyệt.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end', backgroundColor: 'var(--bg-hover)' }}>
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="btn btn-secondary" style={{ minWidth: '100px' }}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }}>{form.id ? 'Cập nhật' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {viewingProduct && (
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
          onClick={() => setViewingProduct(null)}
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
                onClick={() => setViewingProduct(null)}
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
                  src={getProductImageUrl(viewingProduct.imageUrl)}
                  alt={viewingProduct.commodityName}
                  style={{ width: '120px', height: '120px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/image.png'; }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--text-main)' }}>{viewingProduct.commodityName}</h2>
                  <div>Mã HS sản phẩm: <code style={{ fontSize: '14px', fontWeight: '700' }}>{viewingProduct.commodityCode}</code></div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <span className={`badge ${viewingProduct.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '11px', padding: '4px 8px' }}>
                      {viewingProduct.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </span>
                    <span className={`badge ${viewingProduct.approvalStatus === 'APPROVED' ? 'badge-success' :
                      viewingProduct.approvalStatus === 'PENDING' ? 'badge-warning' : 'badge-danger'
                      }`} style={{ fontSize: '11px', padding: '4px 8px' }}>
                      {viewingProduct.approvalStatus === 'APPROVED' ? 'Đã duyệt' :
                        viewingProduct.approvalStatus === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Catalog Categories info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Nhóm mặt hàng</label>
                  <strong style={{ fontSize: '14px' }}>{viewingProduct.group?.groupName || '-'}</strong>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Loại mặt hàng</label>
                  <strong style={{ fontSize: '14px' }}>{viewingProduct.type?.typeName || '-'}</strong>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Đơn vị đo lường</label>
                  <strong style={{ fontSize: '14px' }}>{viewingProduct.unit?.unitName} ({viewingProduct.unit?.symbol})</strong>
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
                  {viewingProduct.description || 'Không có mô tả chi tiết cho mặt hàng này.'}
                </div>
              </div>

              {/* Junction relationships lists */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', paddingTop: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>🌎 Quốc gia đối tác nhập khẩu</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(viewingProduct.countries || []).length > 0 ? (
                      (viewingProduct.countries || []).map(c => (
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
                    {(viewingProduct.qualityStandards || []).length > 0 ? (
                      (viewingProduct.qualityStandards || []).map(qs => (
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
                  <div>👤 Người tạo: <strong>{viewingProduct.createdBy?.fullName || viewingProduct.createdBy?.email || 'Hệ thống'}</strong></div>
                  {viewingProduct.createdAt && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thời gian tạo: {new Date(viewingProduct.createdAt).toLocaleString('vi-VN')}</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>👤 Cập nhật cuối: <strong>{viewingProduct.updatedBy?.fullName || viewingProduct.updatedBy?.email || 'Hệ thống'}</strong></div>
                  {viewingProduct.updatedAt && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thời gian sửa: {new Date(viewingProduct.updatedAt).toLocaleString('vi-VN')}</div>
                  )}
                </div>
              </div>

              {/* Approval metadata logs */}
              {viewingProduct.approvalStatus === 'APPROVED' && viewingProduct.approvedBy && (
                <div style={{ backgroundColor: 'var(--bg-hover)', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border-color)', marginTop: '8px' }}>
                  <span>🔒 Phê duyệt bởi: <strong>{viewingProduct.approvedBy?.fullName || viewingProduct.approvedBy?.email}</strong></span>
                  {viewingProduct.approvedAt && (
                    <span style={{ color: 'var(--text-muted)' }}>Thời gian duyệt: {new Date(viewingProduct.approvedAt).toLocaleString('vi-VN')}</span>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)' }}>
              <button type="button" onClick={() => setViewingProduct(null)} className="btn btn-primary" style={{ minWidth: '100px' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
