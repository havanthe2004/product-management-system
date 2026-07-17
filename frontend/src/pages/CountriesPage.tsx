import React, { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { saveCatalog, deleteCatalog, restoreCatalog } from '../services/catalog.service';
import { useCountryData } from '../hooks/useCountryData';

// Import split components
import CountryTable from '../components/countries/CountryTable';
import CountryFormModal from '../components/countries/CountryFormModal';
import CountryDetailsModal from '../components/countries/CountryDetailsModal';
import CountryFilters from '../components/countries/CountryFilters';

export default function CountriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashView, setIsTrashView] = useState(false);
  const [viewingCountry, setViewingCountry] = useState<any | null>(null);

  const auth = useAppSelector((state) => state.auth);
  const userRole = auth.user?.role;
  const isAuthorizedToApprove = userRole === 'ADMIN' || userRole === 'MANAGER';

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [approvalFilter, setApprovalFilter] = useState('ALL');

  // Custom data hook with backend query parameters
  const { countries, fetchCountries } = useCountryData(isTrashView, {
    search: searchQuery,
    status: statusFilter,
    approvalStatus: approvalFilter
  });

  const [countryForm, setCountryForm] = useState({
    id: null as any,
    isoCode: '',
    countryName: '',
    description: '',
    status: 'INACTIVE',
    approvalStatus: 'PENDING'
  });

  const resetForm = () => {
    setCountryForm({
      id: null,
      isoCode: '',
      countryName: '',
      description: '',
      status: 'INACTIVE',
      approvalStatus: 'PENDING'
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCatalog('countries', countryForm);
      resetForm();
      setIsModalOpen(false);
      fetchCountries();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (c: any) => {
    if (!confirm(`Bạn có chắc chắn muốn duyệt quốc gia "${c.countryName}"?`)) return;
    try {
      await saveCatalog('countries', {
        ...c,
        approvalStatus: 'APPROVED'
      });
      fetchCountries();
    } catch (err: any) {
      alert('Lỗi duyệt: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (c: any) => {
    if (!confirm(`Bạn muốn từ chối quốc gia "${c.countryName}"?`)) return;
    try {
      await saveCatalog('countries', { ...c, approvalStatus: 'REJECTED' });
      fetchCountries();
    } catch (err: any) {
      alert('Lỗi từ chối: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRestore = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn khôi phục quốc gia "${name}"?`)) return;
    try {
      await restoreCatalog('countries', id);
      fetchCountries();
    } catch (err: any) {
      alert('Lỗi khôi phục: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Bạn muốn xóa quốc gia ${name}?`)) return;
    try {
      await deleteCatalog('countries', id);
      fetchCountries();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (c: any) => {
    setCountryForm({
      id: c.id,
      isoCode: c.isoCode,
      countryName: c.countryName,
      description: c.description || '',
      status: c.status,
      approvalStatus: c.approvalStatus
    });
    setIsModalOpen(true);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
          {isTrashView ? '🗑️ Thùng rác các nước hợp tác' : 'Danh sách các nước hợp tác'}
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
              ➕ Thêm nước hợp tác
            </button>
          )}
        </div>
      </div>

      {/* Filter Component */}
      <CountryFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        approvalFilter={approvalFilter}
        setApprovalFilter={setApprovalFilter}
      />

      {/* Table Card */}
      <CountryTable
        countries={countries}
        onViewDetails={setViewingCountry}
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
        <CountryFormModal
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          onSave={handleSave}
          countryForm={countryForm}
          setCountryForm={setCountryForm}
          isAuthorizedToApprove={isAuthorizedToApprove}
        />
      )}

      {/* Modal for View Details */}
      {viewingCountry && (
        <CountryDetailsModal
          viewingCountry={viewingCountry}
          onClose={() => setViewingCountry(null)}
        />
      )}
    </div>
  );
}
