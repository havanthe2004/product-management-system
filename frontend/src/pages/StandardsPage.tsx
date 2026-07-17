import React, { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { saveCatalog, deleteCatalog, restoreCatalog } from '../services/catalog.service';
import { useStandardData } from '../hooks/useStandardData';

// Import split components
import StandardTable from '../components/standards/StandardTable';
import StandardFormModal from '../components/standards/StandardFormModal';
import StandardDetailsModal from '../components/standards/StandardDetailsModal';
import StandardFilters from '../components/standards/StandardFilters';

export default function StandardsPage() {
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

  // Custom data hook with backend query parameters
  const { standards, fetchStandards } = useStandardData(isTrashView, {
    search: searchQuery,
    status: statusFilter,
    approvalStatus: approvalFilter
  });

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
    if (!confirm(`Bạn có chắc chắn muốn duyệt tiêu chuẩn "${s.standardName}"?`)) return;
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
    if (!confirm(`Bạn muốn từ chối tiêu chuẩn "${s.standardName}"?`)) return;
    try {
      await saveCatalog('quality-standards', { ...s, approvalStatus: 'REJECTED' });
      fetchStandards();
    } catch (err: any) {
      alert('Lỗi từ chối: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRestore = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn khôi phục tiêu chuẩn "${name}"?`)) return;
    try {
      await restoreCatalog('quality-standards', id);
      fetchStandards();
    } catch (err: any) {
      alert('Lỗi khôi phục: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Bạn muốn xóa tiêu chuẩn ${name}?`)) return;
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
