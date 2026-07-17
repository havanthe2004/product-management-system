import React, { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { saveCatalog, deleteCatalog, restoreCatalog } from '../services/catalog.service';
import { useGroupData } from '../hooks/useGroupData';

// Import split components
import GroupTable from '../components/commodity-groups/GroupTable';
import GroupFormModal from '../components/commodity-groups/GroupFormModal';
import GroupDetailsModal from '../components/commodity-groups/GroupDetailsModal';
import GroupFilters from '../components/commodity-groups/GroupFilters';

export default function CommodityGroupsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashView, setIsTrashView] = useState(false);
  const [viewingGroup, setViewingGroup] = useState<any | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [approvalFilter, setApprovalFilter] = useState('ALL');

  const auth = useAppSelector((state) => state.auth);
  const userRole = auth.user?.role;
  const isAuthorizedToApprove = userRole === 'ADMIN' || userRole === 'MANAGER';

  // Custom data hook with backend query parameters
  const { groups, fetchGroups } = useGroupData(isTrashView, {
    search: searchQuery,
    status: statusFilter,
    approvalStatus: approvalFilter
  });

  const [groupForm, setGroupForm] = useState({
    id: null as any,
    groupCode: '',
    groupName: '',
    description: '',
    status: 'INACTIVE',
    approvalStatus: 'PENDING'
  });

  const resetForm = () => {
    setGroupForm({
      id: null,
      groupCode: '',
      groupName: '',
      description: '',
      status: 'INACTIVE',
      approvalStatus: 'PENDING'
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCatalog('commodity-groups', groupForm);
      resetForm();
      setIsModalOpen(false);
      fetchGroups();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (g: any) => {
    if (!confirm(`Bạn có chắc chắn muốn duyệt nhóm mặt hàng "${g.groupName}"?`)) return;
    try {
      await saveCatalog('commodity-groups', {
        ...g,
        approvalStatus: 'APPROVED'
      });
      fetchGroups();
    } catch (err: any) {
      alert('Lỗi duyệt: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (g: any) => {
    if (!confirm(`Bạn muốn từ chối nhóm mặt hàng "${g.groupName}"?`)) return;
    try {
      await saveCatalog('commodity-groups', { ...g, approvalStatus: 'REJECTED' });
      fetchGroups();
    } catch (err: any) {
      alert('Lỗi từ chối: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRestore = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn khôi phục nhóm mặt hàng "${name}"?`)) return;
    try {
      await restoreCatalog('commodity-groups', id);
      fetchGroups();
    } catch (err: any) {
      alert('Lỗi khôi phục: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Bạn muốn xóa nhóm ${name}?`)) return;
    try {
      await deleteCatalog('commodity-groups', id);
      fetchGroups();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (g: any) => {
    setGroupForm({
      id: g.id,
      groupCode: g.groupCode,
      groupName: g.groupName,
      description: g.description || '',
      status: g.status,
      approvalStatus: g.approvalStatus
    });
    setIsModalOpen(true);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
          {isTrashView ? '🗑️ Thùng rác nhóm mặt hàng' : 'Danh sách nhóm mặt hàng'}
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
              ➕ Thêm nhóm mặt hàng
            </button>
          )}
        </div>
      </div>

      {/* Filter Component */}
      <GroupFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        approvalFilter={approvalFilter}
        setApprovalFilter={setApprovalFilter}
      />

      {/* Table Card */}
      <GroupTable
        groups={groups}
        onViewDetails={setViewingGroup}
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
        <GroupFormModal
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          onSave={handleSave}
          groupForm={groupForm}
          setGroupForm={setGroupForm}
          isAuthorizedToApprove={isAuthorizedToApprove}
        />
      )}

      {/* Modal for View Details */}
      {viewingGroup && (
        <GroupDetailsModal
          viewingGroup={viewingGroup}
          onClose={() => setViewingGroup(null)}
        />
      )}
    </div>
  );
}
