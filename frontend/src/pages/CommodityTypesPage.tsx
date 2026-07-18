import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import { saveCatalog, deleteCatalog, restoreCatalog } from '../services/catalog.service';
import { useTypeData } from '../hooks/useTypeData';
import { useSearchParams } from 'react-router-dom';

// Import split components
import TypeTable from '../components/commodity-types/TypeTable';
import TypeFormModal from '../components/commodity-types/TypeFormModal';
import TypeDetailsModal from '../components/commodity-types/TypeDetailsModal';
import TypeFilters from '../components/commodity-types/TypeFilters';
import Pagination from '../components/common/Pagination';

export default function CommodityTypesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashView, setIsTrashView] = useState(false);
  const [viewingType, setViewingType] = useState<any | null>(null);

  const auth = useAppSelector((state) => state.auth);
  const userRole = auth.user?.role;
  const isAuthorizedToApprove = userRole === 'ADMIN' || userRole === 'MANAGER';

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [approvalFilter, setApprovalFilter] = useState('ALL');
  const [groupFilter, setGroupFilter] = useState('ALL');

  // Pagination states from URL query params
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '10');

  // Custom data hook with backend query parameters
  const { types, totalItems, groups, fetchTypesAndGroups } = useTypeData(isTrashView, {
    search: searchQuery,
    status: statusFilter,
    approvalStatus: approvalFilter,
    groupId: groupFilter,
    page: currentPage,
    limit: pageSize
  });

  // Reset page when filters change (skip initial render to persist F5)
  const prevFilters = useRef({ searchQuery, statusFilter, approvalFilter, groupFilter, isTrashView });
  useEffect(() => {
    const filtersChanged =
      prevFilters.current.searchQuery !== searchQuery ||
      prevFilters.current.statusFilter !== statusFilter ||
      prevFilters.current.approvalFilter !== approvalFilter ||
      prevFilters.current.groupFilter !== groupFilter ||
      prevFilters.current.isTrashView !== isTrashView;

    prevFilters.current = { searchQuery, statusFilter, approvalFilter, groupFilter, isTrashView };

    if (!filtersChanged) return;

    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', '1');
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, approvalFilter, groupFilter, isTrashView]);

  const totalPages = Math.ceil(totalItems / pageSize);

  const [typeForm, setTypeForm] = useState({
    id: null as any,
    typeCode: '',
    typeName: '',
    description: '',
    status: 'INACTIVE',
    approvalStatus: 'PENDING',
    groupId: ''
  });

  const resetForm = () => {
    setTypeForm({
      id: null,
      typeCode: '',
      typeName: '',
      description: '',
      status: 'INACTIVE',
      approvalStatus: 'PENDING',
      groupId: ''
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCatalog('commodity-types', typeForm);
      resetForm();
      setIsModalOpen(false);
      fetchTypesAndGroups();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (t: any) => {
    if (!confirm(`Bạn có chắc chắn muốn duyệt loại mặt hàng "${t.typeName}"?`)) return;
    try {
      await saveCatalog('commodity-types', {
        ...t,
        groupId: t.group?.id,
        approvalStatus: 'APPROVED'
      });
      fetchTypesAndGroups();
    } catch (err: any) {
      alert('Lỗi duyệt: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (t: any) => {
    if (!confirm(`Bạn muốn từ chối loại mặt hàng "${t.typeName}"?`)) return;
    try {
      await saveCatalog('commodity-types', {
        ...t,
        groupId: t.group?.id,
        approvalStatus: 'REJECTED'
      });
      fetchTypesAndGroups();
    } catch (err: any) {
      alert('Lỗi từ chối: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRestore = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn khôi phục loại mặt hàng "${name}"?`)) return;
    try {
      await restoreCatalog('commodity-types', id);
      fetchTypesAndGroups();
    } catch (err: any) {
      alert('Lỗi khôi phục: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Bạn muốn xóa loại mặt hàng "${name}"?`)) return;
    try {
      await deleteCatalog('commodity-types', id);
      fetchTypesAndGroups();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (t: any) => {
    setTypeForm({
      id: t.id,
      typeCode: t.typeCode,
      typeName: t.typeName,
      description: t.description || '',
      status: t.status,
      approvalStatus: t.approvalStatus,
      groupId: t.group?.id?.toString() || ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
          {isTrashView ? '🗑️ Thùng rác loại mặt hàng' : 'Danh sách loại mặt hàng'}
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
              ➕ Thêm loại mặt hàng
            </button>
          )}
        </div>
      </div>

      {/* Filter Component */}
      <TypeFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        approvalFilter={approvalFilter}
        setApprovalFilter={setApprovalFilter}
        groupFilter={groupFilter}
        setGroupFilter={setGroupFilter}
        groups={groups}
      />

      {/* Table Card */}
      <TypeTable
        types={types}
        onViewDetails={setViewingType}
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
        <TypeFormModal
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          onSave={handleSave}
          typeForm={typeForm}
          setTypeForm={setTypeForm}
          groups={groups}
          isAuthorizedToApprove={isAuthorizedToApprove}
        />
      )}

      {/* Modal for View Details */}
      {viewingType && (
        <TypeDetailsModal
          viewingType={viewingType}
          onClose={() => setViewingType(null)}
        />
      )}
    </div>
  );
}
