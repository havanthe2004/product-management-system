import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { UserRole } from '../store/slices/authSlice';
import { getCommodityGroups, getUnits } from '../services/catalog.service';
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
} from '../store/slices/productsSlice';

export default function ProductsTab() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const products = useAppSelector((state) => state.products);

  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCat, resUnit] = await Promise.all([
          getCommodityGroups(),
          getUnits()
        ]);
        if (resCat.success) setCategories(resCat.data);
        if (resUnit.success) setUnits(resUnit.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

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

  const filteredProducts = products.list.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(products.searchQuery.toLowerCase()) ||
      product.hsCode.includes(products.searchQuery) ||
      product.origin.toLowerCase().includes(products.searchQuery.toLowerCase());
    const matchesStatus = products.statusFilter === 'ALL' || product.status === products.statusFilter;
    const matchesCategory = products.categoryFilter === 'ALL' || product.categoryId === Number(products.categoryFilter);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="fade-in">
      {/* Filters & Add Button */}
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
          {/* Tất cả các role đều có quyền thêm mặt hàng */}
          <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
            ➕ Thêm hàng hóa mới
          </button>
        </div>
      </div>

      {/* Products Table */}
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
                      <span className={`badge ${product.status === ProductStatus.APPROVED ? 'badge-success' :
                        product.status === ProductStatus.PENDING ? 'badge-warning' : 'badge-danger'
                        }`}>
                        {product.status === ProductStatus.APPROVED ? 'Đã duyệt' :
                          product.status === ProductStatus.PENDING ? 'Chờ duyệt' : 'Bị từ chối'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        {/* Tất cả các role đều có quyền chỉnh sửa/xóa */}
                        <button onClick={() => handleOpenEditModal(product)} className="btn btn-secondary btn-sm" disabled={!product.allowEdit && auth.user?.role === UserRole.OFFICER}>
                          ✏️ Sửa
                        </button>
                        <button onClick={() => { if (confirm('Bạn muốn xóa sản phẩm này không?')) dispatch(deleteProduct(product.id)); }} className="btn btn-danger btn-sm">
                          🗑️ Xóa
                        </button>

                        {/* Duyệt/Từ chối cho ADMIN và MANAGER */}
                        {(auth.user?.role === UserRole.ADMIN || auth.user?.role === UserRole.MANAGER) && product.status === ProductStatus.PENDING && (
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
