import React, { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { saveCatalog, deleteCatalog, restoreCatalog } from '../services/catalog.service';
import { useUnitData } from '../hooks/useUnitData';

// Import split components
import UnitTable from '../components/units/UnitTable';
import UnitFormModal from '../components/units/UnitFormModal';
import UnitDetailsModal from '../components/units/UnitDetailsModal';

export default function UnitsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashView, setIsTrashView] = useState(false);
  const [viewingUnit, setViewingUnit] = useState<any | null>(null);
  
  const auth = useAppSelector((state) => state.auth);
  const userRole = auth.user?.role;
  const isAuthorizedToApprove = userRole === 'ADMIN' || userRole === 'MANAGER';

  // Custom data hook
  const { dbUnits, fetchUnits } = useUnitData(isTrashView);

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
    if (!confirm(`Bạn có chắc chắn muốn duyệt đơn vị tính "${u.unitName}"?`)) return;
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
    if (!confirm(`Bạn muốn từ chối đơn vị tính "${u.unitName}"?`)) return;
    try {
      await saveCatalog('units', { ...u, approvalStatus: 'REJECTED' });
      fetchUnits();
    } catch (err: any) {
      alert('Lỗi từ chối: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRestore = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn khôi phục đơn vị tính "${name}"?`)) return;
    try {
      await restoreCatalog('units', id);
      fetchUnits();
    } catch (err: any) {
      alert('Lỗi khôi phục: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Bạn muốn xóa đơn vị tính ${name}?`)) return;
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
