import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import { saveCatalog, deleteCatalog, restoreCatalog } from '../services/catalog.service';
import { useUnitData } from '../hooks/useUnitData';
import { useSearchParams } from 'react-router-dom';
import { useConfirm } from '../context/ConfirmContext';

// Import split components
import UnitTable from '../components/units/UnitTable';
import UnitFormModal from '../components/units/UnitFormModal';
import UnitDetailsModal from '../components/units/UnitDetailsModal';
import UnitFilters from '../components/units/UnitFilters';
import Pagination from '../components/common/Pagination';

export default function UnitsPage() {
  const confirm = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashView, setIsTrashView] = useState(false);
  const [viewingUnit, setViewingUnit] = useState<any | null>(null);
  
  const auth = useAppSelector((state) => state.auth);
  const userRole = auth.user?.role;
  const isAuthorizedToApprove = userRole === 'ADMIN' || userRole === 'MANAGER';

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [approvalFilter, setApprovalFilter] = useState('ALL');

  // Pagination states from URL query params
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '10');

  // Custom data hook with backend query parameters
  const { dbUnits, totalItems, fetchUnits } = useUnitData(isTrashView, {
    search: searchQuery,
    status: statusFilter,
    approvalStatus: approvalFilter,
    page: currentPage,
    limit: pageSize
  });

  // Reset page when filters change (skip initial render to persist F5)
  const prevFilters = useRef({ searchQuery, statusFilter, approvalFilter, isTrashView });
  useEffect(() => {
    const filtersChanged =
      prevFilters.current.searchQuery !== searchQuery ||
      prevFilters.current.statusFilter !== statusFilter ||
      prevFilters.current.approvalFilter !== approvalFilter ||
      prevFilters.current.isTrashView !== isTrashView;

    prevFilters.current = { searchQuery, statusFilter, approvalFilter, isTrashView };

    if (!filtersChanged) return;

    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', '1');
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, approvalFilter, isTrashView]);

  const totalPages = Math.ceil(totalItems / pageSize);

  const [unitForm, setUnitForm] = useState({
    id: null as any,
    unitCode: '',
    unitName: '',
    symbol: '',
    description: '',
    status: 'INACTIVE',
    approvalStatus: 'PENDING'
  });

  const resetForm = () => {
    setUnitForm({
      id: null,
      unitCode: '',
      unitName: '',
      symbol: '',
      description: '',
      status: 'INACTIVE',
      approvalStatus: 'PENDING'
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const isConfirmedSave = await confirm({
      title: unitForm.id ? "Xác nhận cập nhật" : "Xác nhận thêm mới",
      message: unitForm.id ? "Bạn có chắc chắn muốn cập nhật đơn vị tính này không?" : "Bạn có chắc chắn muốn thêm đơn vị tính mới này không?",
      confirmText: unitForm.id ? "Cập nhật" : "Thêm mới",
      cancelText: "Hủy",
      type: "info"
    });
    if (!isConfirmedSave) return;

    try {
      await saveCatalog('units', unitForm);
      resetForm();
      setIsModalOpen(false);
      fetchUnits();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (u: any) => {
    const isConfirmedApprove = await confirm({
      title: "Phê duyệt đơn vị tính",
      message: `Bạn có chắc chắn muốn duyệt đơn vị tính "${u.unitName}"?`,
      confirmText: "Phê duyệt",
      cancelText: "Hủy",
      type: "success"
    });
    if (!isConfirmedApprove) return;
    try {
      await saveCatalog('units', {
        ...u,
        approvalStatus: 'APPROVED'
      });
      fetchUnits();
    } catch (err: any) {
      alert('Lỗi duyệt: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (u: any) => {
    const isConfirmedReject = await confirm({
      title: "Từ chối đơn vị tính",
      message: `Bạn muốn từ chối đơn vị tính "${u.unitName}"?`,
      confirmText: "Từ chối",
      cancelText: "Hủy",
      type: "danger"
    });
    if (!isConfirmedReject) return;
    try {
      await saveCatalog('units', { ...u, approvalStatus: 'REJECTED' });
      fetchUnits();
    } catch (err: any) {
      alert('Lỗi từ chối: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRestore = async (id: number, name: string) => {
    const isConfirmedRestore = await confirm({
      title: "Khôi phục đơn vị tính",
      message: `Bạn có chắc muốn khôi phục đơn vị tính "${name}"?`,
      confirmText: "Khôi phục",
      cancelText: "Hủy",
      type: "success"
    });
    if (!isConfirmedRestore) return;
    try {
      await restoreCatalog('units', id);
      fetchUnits();
    } catch (err: any) {
      alert('Lỗi khôi phục: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const isConfirmedDelete = await confirm({
      title: "Xóa đơn vị tính",
      message: `Bạn muốn xóa đơn vị tính ${name}?`,
      confirmText: "Xóa",
      cancelText: "Hủy",
      type: "danger"
    });
    if (!isConfirmedDelete) return;
    try {
      await deleteCatalog('units', id);
      fetchUnits();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (u: any) => {
    setUnitForm({
      id: u.id,
      unitCode: u.unitCode || '',
      unitName: u.unitName,
      symbol: u.symbol,
      description: u.description || '',
      status: u.status,
      approvalStatus: u.approvalStatus
    });
    setIsModalOpen(true);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
          {isTrashView ? '🗑️ Thùng rác đơn vị đo lường' : 'Danh sách đơn vị đo lường'}
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
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              ➕ Thêm đơn vị đo lường
            </button>
          )}
        </div>
      </div>

      {/* Filter Component */}
      <UnitFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        approvalFilter={approvalFilter}
        setApprovalFilter={setApprovalFilter}
      />

      {/* Table Card */}
      <UnitTable
        dbUnits={dbUnits}
        onViewDetails={setViewingUnit}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onApprove={handleApprove}
        onReject={handleReject}
        isTrashView={isTrashView}
        isAuthorizedToApprove={isAuthorizedToApprove}
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

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <UnitFormModal
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          onSave={handleSave}
          unitForm={unitForm}
          setUnitForm={setUnitForm}
          isAuthorizedToApprove={isAuthorizedToApprove}
        />
      )}

      {/* Modal for View Details */}
      {viewingUnit && (
        <UnitDetailsModal
          viewingUnit={viewingUnit}
          onClose={() => setViewingUnit(null)}
        />
      )}
    </div>
  );
}
