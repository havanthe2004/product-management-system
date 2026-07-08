import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  UserRole,
  switchRole
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

function App() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const products = useAppSelector((state) => state.products);
  const categories = useAppSelector((state) => state.categories.list);
  const units = useAppSelector((state) => state.units.list);

  // Theme state
  const [isDark, setIsDark] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    categoryId: 1,
    unitId: 1,
    hsCode: '',
    origin: '',
    description: '',
    allowEdit: true,
  });

  // Apply theme class to body
  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDark]);

  // Open modal for adding
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

  // Open modal for editing
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

  // Handle form input change
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

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      dispatch(updateProduct({
        id: editingProduct.id,
        ...formData,
        updatedBy: auth.user?.username || 'system',
      }));
    } else {
      dispatch(addProduct({
        ...formData,
        createdBy: auth.user?.username || 'system',
      }));
    }
    setIsModalOpen(false);
  };

  // Filter products
  const filteredProducts = products.list.filter((product) => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(products.searchQuery.toLowerCase()) ||
                          product.hsCode.includes(products.searchQuery) ||
                          product.origin.toLowerCase().includes(products.searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = products.statusFilter === 'ALL' || product.status === products.statusFilter;

    // Category filter
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

  return (
    <div className="app-container fade-in">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
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
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bảng điều khiển hệ thống</span>
          </div>
        </div>

        {/* User Card */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          marginBottom: '32px'
        }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Người dùng hiện tại
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
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
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{auth.user?.fullName}</p>
              <span className={`badge ${auth.user?.role === UserRole.ADMIN ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '9px', padding: '2px 6px', marginTop: '2px' }}>
                {auth.user?.role}
              </span>
            </div>
          </div>

          {/* Toggle Role (Demo Helper) */}
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Chuyển vai trò (Thử nghiệm)</p>
            <button
              onClick={() => dispatch(switchRole(auth.user?.role === UserRole.ADMIN ? UserRole.OFFICER : UserRole.ADMIN))}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', fontSize: '11px' }}
            >
              🔄 Đổi sang {auth.user?.role === UserRole.ADMIN ? 'NHÂN VIÊN' : 'QUẢN TRỊ'}
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <a href="#" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            📦 Quản lý sản phẩm
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '14px', opacity: 0.6, cursor: 'not-allowed' }}>
            📁 Danh mục
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '14px', opacity: 0.6, cursor: 'not-allowed' }}>
            📏 Đơn vị đo lường
          </div>
        </div>

        {/* Footer Sidebar (Theme toggle) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {isDark ? '🌙 Chế độ tối' : '☀️ Chế độ sáng'}
          </span>
          <button
            onClick={() => setIsDark(!isDark)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px'
            }}
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
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Quản lý sản phẩm</h1>
          </div>
          <div className="flex-gap-12">
            {auth.user?.role === UserRole.OFFICER && (
              <button onClick={handleOpenAddModal} className="btn btn-primary">
                ➕ Thêm sản phẩm mới
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="content-body">
          {/* Stats Bar */}
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

          {/* Filters Card */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center'
            }}>
              {/* Search */}
              <div style={{ flex: 1, minWidth: '240px' }}>
                <input
                  type="text"
                  placeholder="🔍 Tìm kiếm theo tên, mã HS hoặc xuất xứ..."
                  className="input"
                  value={products.searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                />
              </div>

              {/* Status Filter */}
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

              {/* Category Filter */}
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
            </div>
          </div>

          {/* Table */}
          <div className="table-container fade-in">
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
                            <p style={{
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                              marginTop: '4px',
                              maxWidth: '300px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }} title={product.description}>
                              {product.description || 'Không có mô tả.'}
                            </p>
                          </div>
                        </td>
                        <td>
                          <code style={{ fontSize: '13px' }}>{product.hsCode || 'N/A'}</code>
                        </td>
                        <td>{product.origin || 'N/A'}</td>
                        <td>
                          <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                            {category ? category.name : 'Không rõ'}
                          </span>
                        </td>
                        <td>{unit ? unit.name : 'Không rõ'}</td>
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
                            {/* Officer actions */}
                            {auth.user?.role === UserRole.OFFICER && (
                              <>
                                <button
                                  onClick={() => handleOpenEditModal(product)}
                                  className="btn btn-secondary btn-sm"
                                  disabled={!product.allowEdit}
                                  title={!product.allowEdit ? "Sản phẩm này đã bị khóa chỉnh sửa" : "Sửa sản phẩm"}
                                >
                                  ✏️ Sửa
                                </button>
                                <button
                                  onClick={() => {
                                    if(confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
                                      dispatch(deleteProduct(product.id));
                                    }
                                  }}
                                  className="btn btn-danger btn-sm"
                                >
                                  🗑️ Xóa
                                </button>
                              </>
                            )}

                            {/* Admin actions (Verification flow) */}
                            {auth.user?.role === UserRole.ADMIN && product.status === ProductStatus.PENDING && (
                              <>
                                <button
                                  onClick={() => dispatch(approveProduct({ id: product.id, adminName: auth.user?.username || 'admin' }))}
                                  className="btn btn-success btn-sm"
                                >
                                  ✅ Duyệt
                                </button>
                                <button
                                  onClick={() => dispatch(rejectProduct({ id: product.id, adminName: auth.user?.username || 'admin' }))}
                                  className="btn btn-danger btn-sm"
                                >
                                  ❌ Từ chối
                                </button>
                              </>
                            )}

                            {/* Admin actions after review */}
                            {auth.user?.role === UserRole.ADMIN && product.status !== ProductStatus.PENDING && (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', alignSelf: 'center' }}>
                                Người duyệt: {product.approvedBy || 'Quản trị viên'}
                              </span>
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
                📭 Không tìm thấy sản phẩm nào khớp với tiêu chí tìm kiếm.
              </div>
            )}
          </div>
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
