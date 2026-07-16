import React, { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { saveCatalog, deleteCatalog, restoreCatalog } from '../services/catalog.service';
import { useTypeData } from '../hooks/useTypeData';

// Import split components
import TypeTable from '../components/commodity-types/TypeTable';
import TypeFormModal from '../components/commodity-types/TypeFormModal';
import TypeDetailsModal from '../components/commodity-types/TypeDetailsModal';

export default function CommodityTypesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashView, setIsTrashView] = useState(false);
  const [viewingType, setViewingType] = useState<any | null>(null);

  const auth = useAppSelector((state) => state.auth);
  const userRole = auth.user?.role;
  const isAuthorizedToApprove = userRole === 'ADMIN' || userRole === 'MANAGER';

  // Custom data hook
  const { types, groups, fetchTypesAndGroups } = useTypeData(isTrashView);

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
