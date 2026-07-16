import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import {
  getCommodityGroups,
  getCommodityTypes,
  getUnits,
  getCountries,
  getQualityStandards,
  saveCatalog,
  deleteCatalog,
  restoreCatalog
} from '../services/catalog.service';
import type { Commodity, CommodityGroup, CommodityType, Country, QualityStandard, Unit } from '../types';
import { useCommodityData } from '../hooks/useCommodityData';

// Import split components
import ProductFilters from '../components/products/ProductFilters';
import ProductTable from '../components/products/ProductTable';
import ProductFormModal from '../components/products/ProductFormModal';
import ProductDetailsModal from '../components/products/ProductDetailsModal';

export default function ProductsPage() {
  const [categories, setCategories] = useState<CommodityGroup[]>([]);
  const [types, setTypes] = useState<CommodityType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [standards, setStandards] = useState<QualityStandard[]>([]);

  // Search & Filters State
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

  // Custom data hook
  const { dbProducts, fetchCommodities } = useCommodityData(isTrashView);

  // Load catalogs
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

  useEffect(() => {
    fetchCatalogs();
  }, []);

  // Form State
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
      groupId: '',
      typeId: '',
      unitId: '',
      description: '',
      status: 'INACTIVE',
      approvalStatus: 'PENDING',
      countryIds: [],
      qualityStandardIds: []
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenEditModal = (item: Commodity) => {
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

  // Filter products locally
  const filteredProducts = dbProducts.filter((item) => {
    const s = searchQuery.toLowerCase().trim();
    const matchSearch =
      !s ||
      item.commodityCode.toLowerCase().includes(s) ||
      item.commodityName.toLowerCase().includes(s) ||
      (item.description && item.description.toLowerCase().includes(s));

    const matchGroup = groupFilter === 'ALL' || Number(item.group?.id) === Number(groupFilter);
    const matchType = typeFilter === 'ALL' || Number(item.type?.id) === Number(typeFilter);
    const matchActive = activeFilter === 'ALL' || item.status === activeFilter;
    const matchApproval = approvalFilter === 'ALL' || item.approvalStatus === approvalFilter;

    return matchSearch && matchGroup && matchType && matchActive && matchApproval;
  });

  // Filter types for the form modal dynamically
  const filteredTypesForForm = types.filter(
    (t) => Number(t.groupId || t.group?.id) === Number(form.groupId)
  );

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
          {isTrashView ? '🗑️ Thùng rác danh sách mặt hàng' : 'Quản lý danh sách mặt hàng'}
        </h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isAuthorizedToApprove && (
            <button
              onClick={() => {
                setIsTrashView(!isTrashView);
                resetForm();
              }}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isTrashView ? '📋 Xem Danh Sách' : '🗑️ Thùng Rác'}
            </button>
          )}
          {!isTrashView && (
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              ➕ Thêm mặt hàng
            </button>
          )}
        </div>
      </div>

      {/* Filter Component */}
      {!isTrashView && (
        <ProductFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          groupFilter={groupFilter}
          setGroupFilter={setGroupFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          approvalFilter={approvalFilter}
          setApprovalFilter={setApprovalFilter}
          categories={categories}
          types={types}
        />
      )}

      {/* Table Component */}
      <ProductTable
        filteredProducts={filteredProducts}
        onViewDetails={setViewingProduct}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onApprove={handleApprove}
        isTrashView={isTrashView}
        isAuthorizedToApprove={isAuthorizedToApprove}
        userRole={userRole}
      />

      {/* Modal - Add / Edit Product */}
      {isModalOpen && (
        <ProductFormModal
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          onSave={handleSave}
          form={form}
          setForm={setForm}
          categories={categories}
          units={units}
          countries={countries}
          standards={standards}
          filteredTypesForForm={filteredTypesForForm}
          fileInputRef={fileInputRef}
          handleImageChange={handleImageChange}
          isAuthorizedToApprove={isAuthorizedToApprove}
        />
      )}

      {/* Modal - View Product Details */}
      {viewingProduct && (
        <ProductDetailsModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
        />
      )}
    </div>
  );
}
