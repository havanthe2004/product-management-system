import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  UserRole,
  logout
} from './store/slices/authSlice';
import {
  type Product,
  ProductStatus,
  addProduct,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
  setSearchQuery,
  setStatusFilter,
  setCategoryFilter
} from './store/slices/productsSlice';
import Login from './components/Login';

const API_BASE = 'http://localhost:3000/api';

function App() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const products = useAppSelector((state) => state.products);
  const categories = useAppSelector((state) => state.categories.list);
  const units = useAppSelector((state) => state.units.list);

  // Layout Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'commodity-groups' | 'commodity-types' | 'countries' | 'standards' | 'units' | 'members' | 'audit-logs'>('overview');
  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);

  // Theme state
  const [isDark, setIsDark] = useState(true);

  // Modal states for Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for Product
  const [formData, setFormData] = useState({
    name: '',
    categoryId: 1,
    unitId: 1,
    hsCode: '',
    origin: '',
    description: '',
    allowEdit: true,
  });

  // Dynamic Lists State from Database
  const [groups, setGroups] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [standards, setStandards] = useState<any[]>([]);
  const [dbUnits, setDbUnits] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  // Form states for CRUD Catalog
  const [groupForm, setGroupForm] = useState({ id: null as any, groupCode: '', groupName: '', description: '', status: 'ACTIVE' });
  const [typeForm, setTypeForm] = useState({ id: null as any, typeCode: '', typeName: '', description: '', status: 'ACTIVE', groupId: '' });
  const [countryForm, setCountryForm] = useState({ id: null as any, isoCode: '', countryName: '', region: '', description: '', status: 'ACTIVE' });
  const [standardForm, setStandardForm] = useState({ id: null as any, standardCode: '', standardName: '', description: '', status: 'ACTIVE' });
  const [unitForm, setUnitForm] = useState({ id: null as any, unitCode: '', unitName: '', symbol: '', description: '', status: 'ACTIVE' });

  // Fetch all backend data
  const fetchAllData = async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      };

      const [resGroups, resTypes, resCountries, resStandards, resUnits, resMembers, resLogs] = await Promise.all([
        fetch(`${API_BASE}/commodity-groups`, { headers }),
        fetch(`${API_BASE}/commodity-types`, { headers }),
        fetch(`${API_BASE}/countries`, { headers }),
        fetch(`${API_BASE}/quality-standards`, { headers }),
        fetch(`${API_BASE}/units`, { headers }),
        fetch(`${API_BASE}/users`, { headers }),
        fetch(`${API_BASE}/audit-logs`, { headers })
      ]);

      const jsonGroups = await resGroups.json();
      const jsonTypes = await resTypes.json();
      const jsonCountries = await resCountries.json();
      const jsonStandards = await resStandards.json();
      const jsonUnits = await resUnits.json();
      const jsonMembers = await resMembers.json();
      const jsonLogs = await resLogs.json();

      if (jsonGroups.success) setGroups(jsonGroups.data);
      if (jsonTypes.success) setTypes(jsonTypes.data);
      if (jsonCountries.success) setCountries(jsonCountries.data);
      if (jsonStandards.success) setStandards(jsonStandards.data);
      if (jsonUnits.success) setDbUnits(jsonUnits.data);
      if (jsonMembers.success) setMembers(jsonMembers.data);
      if (jsonLogs.success) setLogs(jsonLogs.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchAllData();
    }
  }, [auth.isAuthenticated, activeTab]);

  // Apply theme class to body
  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDark]);

  if (!auth.isAuthenticated) {
    return <Login />;
  }

  // Open modal for adding product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || 1,
      unitId: units[0]?.id || 1,
      hsCode: '',
      origin: '',
      description: '',
      allowEdit: true,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing product
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      unitId: product.unitId,
      hsCode: product.hsCode,
      origin: product.origin,
      description: product.description,
      allowEdit: product.allowEdit,
    });
    setIsModalOpen(true);
  };

  // Handle form input change for Product
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'categoryId' || name === 'unitId' ? Number(value) : value
      }));
    }
  };

  // Submit product form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      dispatch(updateProduct({
        id: editingProduct.id,
        ...formData,
        updatedBy: auth.user?.email || 'system',
      }));
    } else {
      dispatch(addProduct({
        ...formData,
        createdBy: auth.user?.email || 'system',
      }));
    }
    setIsModalOpen(false);
  };

  // Filter products
  const filteredProducts = products.list.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(products.searchQuery.toLowerCase()) ||
                          product.hsCode.includes(products.searchQuery) ||
                          product.origin.toLowerCase().includes(products.searchQuery.toLowerCase());
    const matchesStatus = products.statusFilter === 'ALL' || product.status === products.statusFilter;
    const matchesCategory = products.categoryFilter === 'ALL' || product.categoryId === Number(products.categoryFilter);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate statistics
  const stats = {
    total: products.list.length,
    approved: products.list.filter(p => p.status === ProductStatus.APPROVED).length,
    pending: products.list.filter(p => p.status === ProductStatus.PENDING).length,
    rejected: products.list.filter(p => p.status === ProductStatus.REJECTED).length,
  };

  // Generic Save API handler
  const handleSaveCatalog = async (e: React.FormEvent, endpoint: string, data: any, resetForm: () => void) => {
    e.preventDefault();
    try {
      const method = data.id ? 'PUT' : 'POST';
      const url = data.id ? `${API_BASE}/${endpoint}/${data.id}` : `${API_BASE}/${endpoint}`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      resetForm();
      fetchAllData();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Generic Delete API handler
  const handleDeleteCatalog = async (endpoint: string, id: number, confirmMsg: string) => {
    if (!confirm(confirmMsg)) return;
    try {
      const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      fetchAllData();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Update Member Role
  const handleUpdateMemberRole = async (id: number, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'OFFICER' : 'ADMIN';
    if (!confirm(`Bạn có chắc chắn muốn đổi vai trò của thành viên này thành ${nextRole}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ roleName: nextRole })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      fetchAllData();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Lock/Unlock Member
  const handleToggleMemberStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    const actionMsg = nextStatus === 'ACTIVE' ? 'mở khóa' : 'khóa';
    if (!confirm(`Bạn có muốn ${actionMsg} tài khoản thành viên này không?`)) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      fetchAllData();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Nav Item Styles Helper
  const getNavItemClass = (tab: string) => {
    return activeTab === tab ? 'sidebar-link active' : 'sidebar-link';
  };

  return (
    <div className="app-container fade-in">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>P</span>
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', lineHeight: 1 }}>ProMan</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hệ thống quản trị</span>
          </div>
        </div>

        {/* User Card */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: auth.user?.role === UserRole.ADMIN ? 'var(--warning)' : 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {auth.user?.fullName.charAt(0)}
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{auth.user?.fullName}</p>
              <span className={`badge ${auth.user?.role === UserRole.ADMIN ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '9px', padding: '2px 6px', marginTop: '2px' }}>
                {auth.user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
          <div className={getNavItemClass('overview')} onClick={() => setActiveTab('overview')}>
            📊 Tổng quan
          </div>

          {/* Submenu for Catalog */}
          <div>
            <div className="sidebar-link" onClick={() => setIsCatalogMenuOpen(!isCatalogMenuOpen)} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>📁 Danh mục dùng chung</span>
              <span>{isCatalogMenuOpen ? '▲' : '▼'}</span>
            </div>
            {isCatalogMenuOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '16px', marginTop: '2px' }}>
                <div className={getNavItemClass('commodity-groups')} onClick={() => setActiveTab('commodity-groups')} style={{ fontSize: '13px', padding: '8px 12px' }}>
                  ▪ Nhóm mặt hàng
                </div>
                <div className={getNavItemClass('commodity-types')} onClick={() => setActiveTab('commodity-types')} style={{ fontSize: '13px', padding: '8px 12px' }}>
                  ▪ Loại mặt hàng
                </div>
              </div>
            )}
          </div>

          <div className={getNavItemClass('countries')} onClick={() => setActiveTab('countries')}>
            🌍 Các nước hợp tác
          </div>
          <div className={getNavItemClass('standards')} onClick={() => setActiveTab('standards')}>
            🛡️ Quản lý tiêu chuẩn
          </div>
          <div className={getNavItemClass('units')} onClick={() => setActiveTab('units')}>
            📏 Quản lý đơn vị tính
          </div>
          {auth.user?.role === UserRole.ADMIN && (
            <>
              <div className={getNavItemClass('members')} onClick={() => setActiveTab('members')}>
                👥 Quản lý thành viên
              </div>
              <div className={getNavItemClass('audit-logs')} onClick={() => setActiveTab('audit-logs')}>
                📜 Nhật ký web
              </div>
            </>
          )}

          {/* Logout Button */}
          <button
            onClick={() => dispatch(logout())}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              marginTop: 'auto',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--danger)',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              width: '100%',
              justifyContent: 'flex-start',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-light)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            🚪 Đăng xuất
          </button>
        </nav>

        {/* Footer Sidebar (Theme toggle) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)', marginTop: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {isDark ? '🌙 Chế độ tối' : '☀️ Chế độ sáng'}
          </span>
          <button
            onClick={() => setIsDark(!isDark)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
          >
            {isDark ? '💡' : '🌑'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>
              {activeTab === 'overview' && '📊 Bảng Điều Khiển Tổng Quan'}
              {activeTab === 'commodity-groups' && '📁 Danh mục nhóm mặt hàng'}
              {activeTab === 'commodity-types' && '📁 Danh mục loại mặt hàng'}
              {activeTab === 'countries' && '🌍 Quản lý quốc gia đối tác'}
              {activeTab === 'standards' && '🛡️ Quản lý tiêu chuẩn kỹ thuật'}
              {activeTab === 'units' && '📏 Quản lý đơn vị đo lường'}
              {activeTab === 'members' && '👥 Quản lý thành viên hệ thống'}
              {activeTab === 'audit-logs' && '📜 Nhật ký hoạt động hệ thống'}
            </h1>
          </div>
        </header>

        {/* Content Body */}
        <div className="content-body" style={{ overflowY: 'auto' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="fade-in">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '32px' }}>📦</div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Tổng số sản phẩm</p>
                    <h3 style={{ fontSize: '24px', fontWeight: '700' }}>{stats.total}</h3>
                  </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '32px' }}>🟢</div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Đã phê duyệt</p>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>{stats.approved}</h3>
                  </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '32px' }}>🟡</div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Chờ duyệt</p>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--warning)' }}>{stats.pending}</h3>
                  </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '32px' }}>🔴</div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Bị từ chối</p>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--danger)' }}>{stats.rejected}</h3>
                  </div>
                </div>
              </div>

              {/* Filters & Product Table */}
              <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <input
                      type="text"
                      placeholder="🔍 Tìm kiếm theo tên, mã HS hoặc xuất xứ..."
                      className="input"
                      value={products.searchQuery}
                      onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    />
                  </div>
                  <div style={{ width: '180px' }}>
                    <select
                      className="input"
                      value={products.statusFilter}
                      onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                    >
                      <option value="ALL">Tất cả trạng thái</option>
                      <option value={ProductStatus.APPROVED}>Đã duyệt</option>
                      <option value={ProductStatus.PENDING}>Chờ duyệt</option>
                      <option value={ProductStatus.REJECTED}>Bị từ chối</option>
                    </select>
                  </div>
                  <div style={{ width: '180px' }}>
                    <select
                      className="input"
                      value={products.categoryFilter}
                      onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
                    >
                      <option value="ALL">Tất cả danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  {auth.user?.role === UserRole.OFFICER && (
                    <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
                      ➕ Thêm hàng hóa mới
                    </button>
                  )}
                </div>
              </div>

              <div className="table-container">
                {filteredProducts.length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Thông tin sản phẩm</th>
                        <th>Mã HS</th>
                        <th>Xuất xứ</th>
                        <th>Danh mục</th>
                        <th>Đơn vị</th>
                        <th>Trạng thái</th>
                        <th style={{ textAlign: 'right' }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const category = categories.find(c => c.id === product.categoryId);
                        const unit = units.find(u => u.id === product.unitId);

                        return (
                          <tr key={product.id}>
                            <td>
                              <div>
                                <strong style={{ fontSize: '15px' }}>{product.name}</strong>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {product.description || 'Không có mô tả.'}
                                </p>
                              </div>
                            </td>
                            <td><code>{product.hsCode || 'N/A'}</code></td>
                            <td>{product.origin || 'N/A'}</td>
                            <td><span className="badge badge-primary">{category ? category.name : 'N/A'}</span></td>
                            <td>{unit ? unit.name : 'N/A'}</td>
                            <td>
                              <span className={`badge ${
                                product.status === ProductStatus.APPROVED ? 'badge-success' :
                                product.status === ProductStatus.PENDING ? 'badge-warning' : 'badge-danger'
                              }`}>
                                {product.status === ProductStatus.APPROVED ? 'Đã duyệt' :
                                 product.status === ProductStatus.PENDING ? 'Chờ duyệt' : 'Bị từ chối'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                {auth.user?.role === UserRole.OFFICER && (
                                  <>
                                    <button onClick={() => handleOpenEditModal(product)} className="btn btn-secondary btn-sm" disabled={!product.allowEdit}>
                                      ✏️ Sửa
                                    </button>
                                    <button onClick={() => { if(confirm('Bạn muốn xóa sản phẩm này không?')) dispatch(deleteProduct(product.id)); }} className="btn btn-danger btn-sm">
                                      🗑️ Xóa
                                    </button>
                                  </>
                                )}
                                {auth.user?.role === UserRole.ADMIN && product.status === ProductStatus.PENDING && (
                                  <>
                                    <button onClick={() => dispatch(approveProduct({ id: product.id, adminName: auth.user?.email || 'admin' }))} className="btn btn-success btn-sm">
                                      ✅ Duyệt
                                    </button>
                                    <button onClick={() => dispatch(rejectProduct({ id: product.id, adminName: auth.user?.email || 'admin' }))} className="btn btn-danger btn-sm">
                                      ❌ Từ chối
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                    📭 Không có sản phẩm nào được hiển thị.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COMMODITY GROUPS */}
          {activeTab === 'commodity-groups' && (
            <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
              {/* Form Card */}
              <div className="card" style={{ height: 'fit-content' }}>
                <h3 style={{ marginBottom: '20px' }}>{groupForm.id ? '📝 Sửa nhóm mặt hàng' : '➕ Thêm nhóm mặt hàng'}</h3>
                <form onSubmit={(e) => handleSaveCatalog(e, 'commodity-groups', groupForm, () => setGroupForm({ id: null, groupCode: '', groupName: '', description: '', status: 'ACTIVE' }))}>
                  <div className="form-group">
                    <label>Mã nhóm <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="text" className="input" required value={groupForm.groupCode} onChange={(e) => setGroupForm({ ...groupForm, groupCode: e.target.value })} placeholder="Ví dụ: DTGD" />
                  </div>
                  <div className="form-group">
                    <label>Tên nhóm <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="text" className="input" required value={groupForm.groupName} onChange={(e) => setGroupForm({ ...groupForm, groupName: e.target.value })} placeholder="Ví dụ: Điện tử Gia Dụng" />
                  </div>
                  <div className="form-group">
                    <label>Mô tả</label>
                    <textarea className="input" rows={3} value={groupForm.description} onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })} placeholder="Mô tả nhóm mặt hàng..." />
                  </div>
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select className="input" value={groupForm.status} onChange={(e) => setGroupForm({ ...groupForm, status: e.target.value })}>
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE">Ngừng hoạt động</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{groupForm.id ? 'Cập nhật' : 'Thêm mới'}</button>
                    {groupForm.id && (
                      <button type="button" onClick={() => setGroupForm({ id: null, groupCode: '', groupName: '', description: '', status: 'ACTIVE' })} className="btn btn-secondary">Hủy</button>
                    )}
                  </div>
                </form>
              </div>

              {/* Table Card */}
              <div className="table-container" style={{ alignSelf: 'start' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Mã nhóm</th>
                      <th>Tên nhóm</th>
                      <th>Mô tả</th>
                      <th>Trạng thái</th>
                      <th style={{ textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((g) => (
                      <tr key={g.id}>
                        <td><code>{g.groupCode}</code></td>
                        <td><strong>{g.groupName}</strong></td>
                        <td>{g.description || '-'}</td>
                        <td>
                          <span className={`badge ${g.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                            {g.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button onClick={() => setGroupForm({ id: g.id, groupCode: g.groupCode, groupName: g.groupName, description: g.description || '', status: g.status })} className="btn btn-secondary btn-sm">✏️ Sửa</button>
                            <button onClick={() => handleDeleteCatalog('commodity-groups', g.id, `Bạn muốn xóa nhóm ${g.groupName}?`)} className="btn btn-danger btn-sm">🗑️ Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: COMMODITY TYPES */}
          {activeTab === 'commodity-types' && (
            <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
              {/* Form Card */}
              <div className="card" style={{ height: 'fit-content' }}>
                <h3 style={{ marginBottom: '20px' }}>{typeForm.id ? '📝 Sửa loại mặt hàng' : '➕ Thêm loại mặt hàng'}</h3>
                <form onSubmit={(e) => handleSaveCatalog(e, 'commodity-types', typeForm, () => setTypeForm({ id: null, typeCode: '', typeName: '', description: '', status: 'ACTIVE', groupId: '' }))}>
                  <div className="form-group">
                    <label>Nhóm mặt hàng liên kết <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <select className="input" required value={typeForm.groupId} onChange={(e) => setTypeForm({ ...typeForm, groupId: e.target.value })}>
                      <option value="">-- Chọn nhóm sản phẩm --</option>
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.groupName} ({g.groupCode})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Mã loại <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="text" className="input" required value={typeForm.typeCode} onChange={(e) => setTypeForm({ ...typeForm, typeCode: e.target.value })} placeholder="Ví dụ: TIVI" />
                  </div>
                  <div className="form-group">
                    <label>Tên loại <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="text" className="input" required value={typeForm.typeName} onChange={(e) => setTypeForm({ ...typeForm, typeName: e.target.value })} placeholder="Ví dụ: Ti vi thông minh" />
                  </div>
                  <div className="form-group">
                    <label>Mô tả</label>
                    <textarea className="input" rows={3} value={typeForm.description} onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })} placeholder="Mô tả loại mặt hàng..." />
                  </div>
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select className="input" value={typeForm.status} onChange={(e) => setTypeForm({ ...typeForm, status: e.target.value })}>
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE">Ngừng hoạt động</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{typeForm.id ? 'Cập nhật' : 'Thêm mới'}</button>
                    {typeForm.id && (
                      <button type="button" onClick={() => setTypeForm({ id: null, typeCode: '', typeName: '', description: '', status: 'ACTIVE', groupId: '' })} className="btn btn-secondary">Hủy</button>
                    )}
                  </div>
                </form>
              </div>

              {/* Table Card */}
              <div className="table-container" style={{ alignSelf: 'start' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Mã loại</th>
                      <th>Tên loại</th>
                      <th>Thuộc nhóm</th>
                      <th>Mô tả</th>
                      <th>Trạng thái</th>
                      <th style={{ textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {types.map((t) => (
                      <tr key={t.id}>
                        <td><code>{t.typeCode}</code></td>
                        <td><strong>{t.typeName}</strong></td>
                        <td><span className="badge badge-primary">{t.group?.groupName || 'Chưa phân nhóm'}</span></td>
                        <td>{t.description || '-'}</td>
                        <td>
                          <span className={`badge ${t.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                            {t.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button onClick={() => setTypeForm({ id: t.id, typeCode: t.typeCode, typeName: t.typeName, description: t.description || '', status: t.status, groupId: t.group?.id?.toString() || '' })} className="btn btn-secondary btn-sm">✏️ Sửa</button>
                            <button onClick={() => handleDeleteCatalog('commodity-types', t.id, `Bạn muốn xóa loại ${t.typeName}?`)} className="btn btn-danger btn-sm">🗑️ Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PARTNER COUNTRIES */}
          {activeTab === 'countries' && (
            <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
              {/* Form Card */}
              <div className="card" style={{ height: 'fit-content' }}>
                <h3 style={{ marginBottom: '20px' }}>{countryForm.id ? '🌍 Sửa nước hợp tác' : '🌍 Thêm nước hợp tác'}</h3>
                <form onSubmit={(e) => handleSaveCatalog(e, 'countries', countryForm, () => setCountryForm({ id: null, isoCode: '', countryName: '', region: '', description: '', status: 'ACTIVE' }))}>
                  <div className="form-group">
                    <label>Mã ISO (Quốc tế) <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="text" className="input" required value={countryForm.isoCode} onChange={(e) => setCountryForm({ ...countryForm, isoCode: e.target.value })} placeholder="Ví dụ: JP, US, VN" />
                  </div>
                  <div className="form-group">
                    <label>Tên quốc gia <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="text" className="input" required value={countryForm.countryName} onChange={(e) => setCountryForm({ ...countryForm, countryName: e.target.value })} placeholder="Ví dụ: Nhật Bản, Hoa Kỳ" />
                  </div>
                  <div className="form-group">
                    <label>Khu vực</label>
                    <input type="text" className="input" value={countryForm.region} onChange={(e) => setCountryForm({ ...countryForm, region: e.target.value })} placeholder="Ví dụ: Châu Á, Châu Âu" />
                  </div>
                  <div className="form-group">
                    <label>Mô tả / Ghi chú</label>
                    <textarea className="input" rows={3} value={countryForm.description} onChange={(e) => setCountryForm({ ...countryForm, description: e.target.value })} placeholder="Thông tin hợp tác chính..." />
                  </div>
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select className="input" value={countryForm.status} onChange={(e) => setCountryForm({ ...countryForm, status: e.target.value })}>
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE">Ngừng hoạt động</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{countryForm.id ? 'Cập nhật' : 'Thêm mới'}</button>
                    {countryForm.id && (
                      <button type="button" onClick={() => setCountryForm({ id: null, isoCode: '', countryName: '', region: '', description: '', status: 'ACTIVE' })} className="btn btn-secondary">Hủy</button>
                    )}
                  </div>
                </form>
              </div>

              {/* Table Card */}
              <div className="table-container" style={{ alignSelf: 'start' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Mã ISO</th>
                      <th>Tên quốc gia</th>
                      <th>Khu vực</th>
                      <th>Mô tả</th>
                      <th>Trạng thái</th>
                      <th style={{ textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map((c) => (
                      <tr key={c.id}>
                        <td><code>{c.isoCode}</code></td>
                        <td><strong>{c.countryName}</strong></td>
                        <td>{c.region || '-'}</td>
                        <td>{c.description || '-'}</td>
                        <td>
                          <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                            {c.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button onClick={() => setCountryForm({ id: c.id, isoCode: c.isoCode, countryName: c.countryName, region: c.region || '', description: c.description || '', status: c.status })} className="btn btn-secondary btn-sm">✏️ Sửa</button>
                            <button onClick={() => handleDeleteCatalog('countries', c.id, `Bạn muốn xóa quốc gia ${c.countryName}?`)} className="btn btn-danger btn-sm">🗑️ Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: QUALITY STANDARDS */}
          {activeTab === 'standards' && (
            <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
              {/* Form Card */}
              <div className="card" style={{ height: 'fit-content' }}>
                <h3 style={{ marginBottom: '20px' }}>{standardForm.id ? '🛡️ Sửa tiêu chuẩn kỹ thuật' : '🛡️ Thêm tiêu chuẩn kỹ thuật'}</h3>
                <form onSubmit={(e) => handleSaveCatalog(e, 'quality-standards', standardForm, () => setStandardForm({ id: null, standardCode: '', standardName: '', description: '', status: 'ACTIVE' }))}>
                  <div className="form-group">
                    <label>Mã tiêu chuẩn <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="text" className="input" required value={standardForm.standardCode} onChange={(e) => setStandardForm({ ...standardForm, standardCode: e.target.value })} placeholder="Ví dụ: ISO 9001, TCVN" />
                  </div>
                  <div className="form-group">
                    <label>Tên tiêu chuẩn <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="text" className="input" required value={standardForm.standardName} onChange={(e) => setStandardForm({ ...standardForm, standardName: e.target.value })} placeholder="Ví dụ: Tiêu chuẩn Quản lý Chất lượng" />
                  </div>
                  <div className="form-group">
                    <label>Mô tả tiêu chuẩn</label>
                    <textarea className="input" rows={3} value={standardForm.description} onChange={(e) => setStandardForm({ ...standardForm, description: e.target.value })} placeholder="Mô tả nội dung tiêu chuẩn..." />
                  </div>
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select className="input" value={standardForm.status} onChange={(e) => setStandardForm({ ...standardForm, status: e.target.value })}>
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE">Ngừng hoạt động</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{standardForm.id ? 'Cập nhật' : 'Thêm mới'}</button>
                    {standardForm.id && (
                      <button type="button" onClick={() => setStandardForm({ id: null, standardCode: '', standardName: '', description: '', status: 'ACTIVE' })} className="btn btn-secondary">Hủy</button>
                    )}
                  </div>
                </form>
              </div>

              {/* Table Card */}
              <div className="table-container" style={{ alignSelf: 'start' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Mã tiêu chuẩn</th>
                      <th>Tên tiêu chuẩn</th>
                      <th>Mô tả</th>
                      <th>Trạng thái</th>
                      <th style={{ textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standards.map((s) => (
                      <tr key={s.id}>
                        <td><code>{s.standardCode}</code></td>
                        <td><strong>{s.standardName}</strong></td>
                        <td>{s.description || '-'}</td>
                        <td>
                          <span className={`badge ${s.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                            {s.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button onClick={() => setStandardForm({ id: s.id, standardCode: s.standardCode, standardName: s.standardName, description: s.description || '', status: s.status })} className="btn btn-secondary btn-sm">✏️ Sửa</button>
                            <button onClick={() => handleDeleteCatalog('quality-standards', s.id, `Bạn muốn xóa tiêu chuẩn ${s.standardName}?`)} className="btn btn-danger btn-sm">🗑️ Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: UNITS OF MEASUREMENT */}
          {activeTab === 'units' && (
            <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
              {/* Form Card */}
              <div className="card" style={{ height: 'fit-content' }}>
                <h3 style={{ marginBottom: '20px' }}>{unitForm.id ? '📏 Sửa đơn vị đo lường' : '📏 Thêm đơn vị đo lường'}</h3>
                <form onSubmit={(e) => handleSaveCatalog(e, 'units', unitForm, () => setUnitForm({ id: null, unitCode: '', unitName: '', symbol: '', description: '', status: 'ACTIVE' }))}>
                  <div className="form-group">
                    <label>Mã đơn vị</label>
                    <input type="text" className="input" value={unitForm.unitCode} onChange={(e) => setUnitForm({ ...unitForm, unitCode: e.target.value })} placeholder="Ví dụ: CAI, HOP" />
                  </div>
                  <div className="form-group">
                    <label>Tên đơn vị <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="text" className="input" required value={unitForm.unitName} onChange={(e) => setUnitForm({ ...unitForm, unitName: e.target.value })} placeholder="Ví dụ: Cái, Hộp" />
                  </div>
                  <div className="form-group">
                    <label>Ký hiệu hiển thị <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="text" className="input" required value={unitForm.symbol} onChange={(e) => setUnitForm({ ...unitForm, symbol: e.target.value })} placeholder="Ví dụ: cái, hộp" />
                  </div>
                  <div className="form-group">
                    <label>Mô tả</label>
                    <textarea className="input" rows={3} value={unitForm.description} onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })} placeholder="Mô tả đơn vị..." />
                  </div>
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select className="input" value={unitForm.status} onChange={(e) => setUnitForm({ ...unitForm, status: e.target.value })}>
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE">Ngừng hoạt động</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{unitForm.id ? 'Cập nhật' : 'Thêm mới'}</button>
                    {unitForm.id && (
                      <button type="button" onClick={() => setUnitForm({ id: null, unitCode: '', unitName: '', symbol: '', description: '', status: 'ACTIVE' })} className="btn btn-secondary">Hủy</button>
                    )}
                  </div>
                </form>
              </div>

              {/* Table Card */}
              <div className="table-container" style={{ alignSelf: 'start' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Mã đơn vị</th>
                      <th>Tên đơn vị</th>
                      <th>Ký hiệu</th>
                      <th>Mô tả</th>
                      <th>Trạng thái</th>
                      <th style={{ textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbUnits.map((u) => (
                      <tr key={u.id}>
                        <td><code>{u.unitCode || '-'}</code></td>
                        <td><strong>{u.unitName}</strong></td>
                        <td><code>{u.symbol}</code></td>
                        <td>{u.description || '-'}</td>
                        <td>
                          <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                            {u.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button onClick={() => setUnitForm({ id: u.id, unitCode: u.unitCode || '', unitName: u.unitName, symbol: u.symbol, description: u.description || '', status: u.status })} className="btn btn-secondary btn-sm">✏️ Sửa</button>
                            <button onClick={() => handleDeleteCatalog('units', u.id, `Bạn muốn xóa đơn vị ${u.unitName}?`)} className="btn btn-danger btn-sm">🗑️ Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: MEMBERS MANAGEMENT */}
          {activeTab === 'members' && auth.user?.role === UserRole.ADMIN && (
            <div className="fade-in table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ và tên</th>
                    <th>Email liên kết</th>
                    <th>Điện thoại</th>
                    <th>Quyền quản trị</th>
                    <th>Trạng thái hoạt động</th>
                    <th style={{ textAlign: 'right' }}>Thao tác bảo mật</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td>#{m.id}</td>
                      <td><strong>{m.fullName}</strong></td>
                      <td><code>{m.email}</code></td>
                      <td>{m.phone || '-'}</td>
                      <td>
                        <span className={`badge ${m.role === 'ADMIN' ? 'badge-warning' : 'badge-primary'}`} style={{ textTransform: 'uppercase' }}>
                          {m.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${m.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                          {m.status === 'ACTIVE' ? 'Đang mở' : 'Đã khóa'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => handleUpdateMemberRole(m.id, m.role)} className="btn btn-secondary btn-sm" disabled={m.email === auth.user?.email}>
                            🔄 Đổi quyền
                          </button>
                          <button onClick={() => handleToggleMemberStatus(m.id, m.status)} className={`btn btn-sm ${m.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`} disabled={m.email === auth.user?.email}>
                            {m.status === 'ACTIVE' ? '🔒 Khóa tài khoản' : '🔑 Mở khóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 8: AUDIT LOGS */}
          {activeTab === 'audit-logs' && auth.user?.role === UserRole.ADMIN && (
            <div className="fade-in table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Người thực hiện</th>
                    <th>Phân hệ</th>
                    <th>Hành động</th>
                    <th>Chi tiết hoạt động</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                      <td><code>{log.email || 'Hệ thống'}</code></td>
                      <td><span className="badge badge-primary">{log.module}</span></td>
                      <td>
                        <span className={`badge ${
                          log.action.includes('THÊM') || log.action.includes('LOGIN') || log.action.includes('REGISTER') ? 'badge-success' :
                          log.action.includes('CẬP NHẬT') ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <div>
                          <strong>{log.description || '-'}</strong>
                          {log.oldData && (
                            <details style={{ marginTop: '6px', cursor: 'pointer' }}>
                              <summary style={{ fontSize: '11px', color: 'var(--primary)' }}>Xem dữ liệu cũ trước khi đổi</summary>
                              <pre style={{ margin: '4px 0 0 0', padding: '8px', fontSize: '11px', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', overflowX: 'auto', borderRadius: '4px' }}>
                                {JSON.stringify(log.oldData, null, 2)}
                              </pre>
                            </details>
                          )}
                          {log.newData && (
                            <details style={{ marginTop: '4px', cursor: 'pointer' }}>
                              <summary style={{ fontSize: '11px', color: 'var(--success)' }}>Xem dữ liệu thay đổi mới nhất</summary>
                              <pre style={{ margin: '4px 0 0 0', padding: '8px', fontSize: '11px', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', overflowX: 'auto', borderRadius: '4px' }}>
                                {JSON.stringify(log.newData, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>

      {/* Modal - Add / Edit Product */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>
                {editingProduct ? '📝 Chỉnh sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
              >
                ✖️
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên sản phẩm <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input"
                  placeholder="Ví dụ: Tai nghe không dây Sony"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Danh mục</label>
                  <select
                    name="categoryId"
                    className="input"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Đơn vị đo lường</label>
                  <select
                    name="unitId"
                    className="input"
                    value={formData.unitId}
                    onChange={handleInputChange}
                  >
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Mã HS</label>
                  <input
                    type="text"
                    name="hsCode"
                    className="input"
                    placeholder="Ví dụ: 8518.30.00"
                    value={formData.hsCode}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Xuất xứ</label>
                  <input
                    type="text"
                    name="origin"
                    className="input"
                    placeholder="Ví dụ: Nhật Bản, Việt Nam"
                    value={formData.origin}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  className="input"
                  rows={3}
                  placeholder="Cung cấp thông số kỹ thuật hoặc đặc tính chi tiết..."
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <input
                  type="checkbox"
                  id="allowEdit"
                  name="allowEdit"
                  checked={formData.allowEdit}
                  onChange={handleInputChange}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="allowEdit" style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Cho phép người dùng khác chỉnh sửa
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
