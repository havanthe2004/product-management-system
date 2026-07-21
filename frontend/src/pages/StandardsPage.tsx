import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import { saveCatalog, deleteCatalog, restoreCatalog } from '../services/catalog.service';
import { useStandardData } from '../hooks/useStandardData';
import { useSearchParams } from 'react-router-dom';
import { useConfirm } from '../context/ConfirmContext';

// Import split components
import StandardTable from '../components/standards/StandardTable';
import StandardFormModal from '../components/standards/StandardFormModal';
import StandardDetailsModal from '../components/standards/StandardDetailsModal';
import StandardFilters from '../components/standards/StandardFilters';
import Pagination from '../components/common/Pagination';

export default function StandardsPage() {
  const confirm = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashView, setIsTrashView] = useState(false);
  const [viewingStandard, setViewingStandard] = useState<any | null>(null);

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
  const { standards, totalItems, fetchStandards } = useStandardData(isTrashView, {
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

  const [standardForm, setStandardForm] = useState({
    id: null as any,
    standardCode: '',
    standardName: '',
    description: '',
    status: 'INACTIVE',
    approvalStatus: 'PENDING'
  });

  const resetForm = () => {
    setStandardForm({
      id: null,
      standardCode: '',
      standardName: '',
      description: '',
      status: 'INACTIVE',
      approvalStatus: 'PENDING'
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const isConfirmedSave = await confirm({
      title: standardForm.id ? "Xác nhận cập nhật" : "Xác nhận thêm mới",
      message: standardForm.id ? "Bạn có chắc chắn muốn cập nhật tiêu chuẩn này không?" : "Bạn có chắc chắn muốn thêm tiêu chuẩn mới này không?",
      confirmText: standardForm.id ? "Cập nhật" : "Thêm mới",
      cancelText: "Hủy",
      type: "info"
    });
    if (!isConfirmedSave) return;

    try {
      await saveCatalog('quality-standards', standardForm);
      resetForm();
      setIsModalOpen(false);
      fetchStandards();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (s: any) => {
    const isConfirmedApprove = await confirm({
      title: "Phê duyệt tiêu chuẩn",
      message: `Bạn có chắc chắn muốn duyệt tiêu chuẩn "${s.standardName}"?`,
      confirmText: "Phê duyệt",
      cancelText: "Hủy",
      type: "success"
    });
    if (!isConfirmedApprove) return;
    try {
      await saveCatalog('quality-standards', {
        ...s,
        approvalStatus: 'APPROVED'
      });
      fetchStandards();
    } catch (err: any) {
      alert('Lỗi duyệt: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (s: any) => {
    const isConfirmedReject = await confirm({
      title: "Từ chối tiêu chuẩn",
      message: `Bạn muốn từ chối tiêu chuẩn "${s.standardName}"?`,
      confirmText: "Từ chối",
      cancelText: "Hủy",
      type: "danger"
    });
    if (!isConfirmedReject) return;
    try {
      await saveCatalog('quality-standards', { ...s, approvalStatus: 'REJECTED' });
      fetchStandards();
    } catch (err: any) {
      alert('Lỗi từ chối: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRestore = async (id: number, name: string) => {
    const isConfirmedRestore = await confirm({
      title: "Khôi phục tiêu chuẩn",
      message: `Bạn có chắc muốn khôi phục tiêu chuẩn "${name}"?`,
      confirmText: "Khôi phục",
      cancelText: "Hủy",
      type: "success"
    });
    if (!isConfirmedRestore) return;
    try {
      await restoreCatalog('quality-standards', id);
      fetchStandards();
    } catch (err: any) {
      alert('Lỗi khôi phục: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const isConfirmedDelete = await confirm({
      title: "Xóa tiêu chuẩn",
      message: `Bạn muốn xóa tiêu chuẩn ${name}?`,
      confirmText: "Xóa",
      cancelText: "Hủy",
      type: "danger"
    });
    if (!isConfirmedDelete) return;
    try {
      await deleteCatalog('quality-standards', id);
      fetchStandards();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (s: any) => {
    setStandardForm({
      id: s.id,
      standardCode: s.standardCode,
      standardName: s.standardName,
      description: s.description || '',
      status: s.status,
      approvalStatus: s.approvalStatus
    });
    setIsModalOpen(true);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
          {isTrashView ? '🗑️ Thùng rác tiêu chuẩn kỹ thuật' : 'Danh sách tiêu chuẩn kỹ thuật'}
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
              ➕ Thêm tiêu chuẩn kỹ thuật
            </button>
          )}
        </div>
      </div>

      {/* Filter Component */}
      <StandardFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        approvalFilter={approvalFilter}
        setApprovalFilter={setApprovalFilter}
      />

      {/* Table Card */}
      <StandardTable
        standards={standards}
        onViewDetails={setViewingStandard}
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
        <StandardFormModal
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          onSave={handleSave}
          standardForm={standardForm}
          setStandardForm={setStandardForm}
          isAuthorizedToApprove={isAuthorizedToApprove}
        />
      )}

      {/* Modal for View Details */}
      {viewingStandard && (
        <StandardDetailsModal
          viewingStandard={viewingStandard}
          onClose={() => setViewingStandard(null)}
        />
      )}
    </div>
  );
}
