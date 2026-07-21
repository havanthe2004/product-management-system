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
import Pagination from '../components/common/Pagination';
import { useSearchParams } from 'react-router-dom';
import { useConfirm } from '../context/ConfirmContext';

export default function ProductsPage() {
  const confirm = useConfirm();
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
  const [countryFilter, setCountryFilter] = useState<number[]>([]);
  const [standardFilter, setStandardFilter] = useState<number[]>([]);

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashView, setIsTrashView] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Commodity | null>(null);

  const auth = useAppSelector((state) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userRole = auth.user?.role;
  const isAuthorizedToApprove = userRole === 'ADMIN' || userRole === 'MANAGER';

  // Pagination states from URL query params
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '10');

  // Custom data hook
  const { dbProducts, totalItems, fetchCommodities } = useCommodityData(isTrashView, {
    search: searchQuery,
    status: activeFilter,
    approvalStatus: approvalFilter,
    groupId: groupFilter,
    typeId: typeFilter,
    countryIds: countryFilter,
    standardIds: standardFilter,
    page: currentPage,
    limit: pageSize
  });

  // Reset page when filters change (skip initial render to persist F5)
  const prevFilters = useRef({
    searchQuery,
    groupFilter,
    typeFilter,
    activeFilter,
    approvalFilter,
    countryFilter: JSON.stringify(countryFilter),
    standardFilter: JSON.stringify(standardFilter),
    isTrashView
  });
  useEffect(() => {
    const prevCountryJson = prevFilters.current.countryFilter;
    const currCountryJson = JSON.stringify(countryFilter);
    const prevStandardJson = prevFilters.current.standardFilter;
    const currStandardJson = JSON.stringify(standardFilter);

    const filtersChanged =
      prevFilters.current.searchQuery !== searchQuery ||
      prevFilters.current.groupFilter !== groupFilter ||
      prevFilters.current.typeFilter !== typeFilter ||
      prevFilters.current.activeFilter !== activeFilter ||
      prevFilters.current.approvalFilter !== approvalFilter ||
      prevCountryJson !== currCountryJson ||
      prevStandardJson !== currStandardJson ||
      prevFilters.current.isTrashView !== isTrashView;

    prevFilters.current = {
      searchQuery,
      groupFilter,
      typeFilter,
      activeFilter,
      approvalFilter,
      countryFilter: currCountryJson,
      standardFilter: currStandardJson,
      isTrashView
    };

    if (!filtersChanged) return;

    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', '1');
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, groupFilter, typeFilter, activeFilter, approvalFilter, countryFilter, standardFilter, isTrashView]);

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

    const isConfirmedSave = await confirm({
      title: form.id ? "Xác nhận cập nhật" : "Xác nhận thêm mới",
      message: form.id ? "Bạn có chắc chắn muốn cập nhật thông tin mặt hàng này không?" : "Bạn có chắc chắn muốn thêm mặt hàng mới này không?",
      confirmText: form.id ? "Cập nhật" : "Thêm mới",
      cancelText: "Hủy",
      type: "info"
    });
    if (!isConfirmedSave) return;

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
    const isConfirmedApprove = await confirm({
      title: approveStatus === 'APPROVED' ? "Xác nhận phê duyệt" : "Xác nhận từ chối",
      message: `Bạn có chắc chắn muốn ${actionText} mặt hàng "${item.commodityName}"?`,
      confirmText: approveStatus === 'APPROVED' ? "Phê duyệt" : "Từ chối",
      cancelText: "Hủy",
      type: approveStatus === 'APPROVED' ? "success" : "danger"
    });
    if (!isConfirmedApprove) return;

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
    const isConfirmedDelete = await confirm({
      title: "Xác nhận xóa",
      message: `Bạn có chắc chắn muốn xóa mặt hàng "${name}"?`,
      confirmText: "Xóa mặt hàng",
      cancelText: "Hủy",
      type: "danger"
    });
    if (!isConfirmedDelete) return;

    try {
      await deleteCatalog('commodities', id);
      fetchCommodities();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRestore = async (id: number, name: string) => {
    const isConfirmedRestore = await confirm({
      title: "Xác nhận khôi phục",
      message: `Bạn có chắc chắn muốn khôi phục mặt hàng "${name}"?`,
      confirmText: "Khôi phục",
      cancelText: "Hủy",
      type: "success"
    });
    if (!isConfirmedRestore) return;

    try {
      await restoreCatalog('commodities', id);
      fetchCommodities();
    } catch (err: any) {
      alert('Lỗi khôi phục: ' + (err.response?.data?.message || err.message));
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

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
          countries={countries}
          standards={standards}
          countryFilter={countryFilter}
          setCountryFilter={setCountryFilter}
          standardFilter={standardFilter}
          setStandardFilter={setStandardFilter}
        />
      )}

      {/* Table Component */}
      <ProductTable
        filteredProducts={dbProducts}
        onViewDetails={setViewingProduct}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onApprove={handleApprove}
        isTrashView={isTrashView}
        isAuthorizedToApprove={isAuthorizedToApprove}
        userRole={userRole}
      />

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={(page) => {
          setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('page', page.toString());
            return next;
          });
        }}
        onPageSizeChange={(size) => {
          setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('page', '1');
            next.set('pageSize', size.toString());
            return next;
          });
        }}
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
