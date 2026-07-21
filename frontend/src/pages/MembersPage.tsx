import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import * as userService from '../services/user.service';
import { useMemberData } from '../hooks/useMemberData';
import { DEFAULT_AVATAR } from '../layouts/Sidebar';
import { useSearchParams } from 'react-router-dom';
import { useConfirm } from '../context/ConfirmContext';

// Import split components
import MemberTable from '../components/members/MemberTable';
import MemberFormModal from '../components/members/MemberFormModal';
import MemberDetailsModal from '../components/members/MemberDetailsModal';
import MemberFilters from '../components/members/MemberFilters';
import Pagination from '../components/common/Pagination';

export default function MembersPage() {
  const auth = useAppSelector((state) => state.auth);
  const confirm = useConfirm();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Pagination states from URL query params
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '10');

  // Custom hook with backend query parameters
  const { members, totalItems, fetchMembers } = useMemberData({
    search: searchQuery,
    status: statusFilter,
    role: roleFilter,
    page: currentPage,
    limit: pageSize
  });

  // Reset page when filters change (skip initial render to persist F5)
  const prevFilters = useRef({ searchQuery, statusFilter, roleFilter });
  useEffect(() => {
    const filtersChanged =
      prevFilters.current.searchQuery !== searchQuery ||
      prevFilters.current.statusFilter !== statusFilter ||
      prevFilters.current.roleFilter !== roleFilter;

    prevFilters.current = { searchQuery, statusFilter, roleFilter };

    if (!filtersChanged) return;

    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', '1');
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, roleFilter]);

  const totalPages = Math.ceil(totalItems / pageSize);

  // Modal states for User
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<any | null>(null);

  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    idCardNumber: '',
    dob: '',
    gender: '',
    phone: '',
    roleName: 'OFFICER'
  });

  const getAvatarUrl = (avatarPath: string | undefined) => {
    if (!avatarPath) return DEFAULT_AVATAR;
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://') || avatarPath.startsWith('data:')) {
      return avatarPath;
    }
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const hostUrl = apiBaseUrl.replace(/\/api$/, '');
    return `${hostUrl}${avatarPath}`;
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.fullName || !userForm.email || !userForm.password || !userForm.idCardNumber || !userForm.roleName) {
      alert("Vui lòng điền các thông tin bắt buộc!");
      return;
    }

    const isConfirmed = await confirm({
      title: "Xác nhận thêm thành viên",
      message: "Bạn có chắc chắn muốn thêm thành viên mới này không?",
      confirmText: "Thêm thành viên",
      cancelText: "Hủy",
      type: "info"
    });
    if (!isConfirmed) return;

    try {
      await userService.createUser(userForm);

      setIsUserModalOpen(false);
      setUserForm({
        fullName: '',
        email: '',
        password: '',
        idCardNumber: '',
        dob: '',
        gender: '',
        phone: '',
        roleName: 'OFFICER'
      });
      fetchMembers();
      alert("Tạo tài khoản thành công!");
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Update role
  const handleUpdateMemberRole = async (id: number, targetRole: string) => {
    const isConfirmed = await confirm({
      title: "Xác nhận đổi quyền hạn",
      message: `Bạn có muốn đổi quyền của thành viên này sang ${targetRole} không?`,
      confirmText: "Thay đổi",
      cancelText: "Hủy",
      type: "warning"
    });
    if (!isConfirmed) {
      fetchMembers();
      return;
    }
    try {
      await userService.updateUserRole(id, targetRole);
      fetchMembers();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
      fetchMembers();
    }
  };

  // Lock/Unlock Member
  const handleToggleMemberStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    const actionMsg = nextStatus === 'ACTIVE' ? 'mở khóa' : 'khóa';
    const isConfirmed = await confirm({
      title: `${nextStatus === 'ACTIVE' ? 'Mở khóa' : 'Khóa'} tài khoản`,
      message: `Bạn có muốn ${actionMsg} tài khoản thành viên này không?`,
      confirmText: nextStatus === 'ACTIVE' ? 'Mở khóa' : 'Khóa',
      cancelText: "Hủy",
      type: nextStatus === 'ACTIVE' ? 'success' : 'danger'
    });
    if (!isConfirmed) return;
    try {
      await userService.toggleUserStatus(id, nextStatus);
      fetchMembers();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewMemberDetails = async (member: any) => {
    try {
      const res = await userService.getUserById(member.id);
      if (res.data) {
        setViewingMember(res.data);
      }
    } catch (err: any) {
      alert('Không thể tải chi tiết thành viên: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Chưa cập nhật';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>Danh sách thành viên</h3>
        <button onClick={() => setIsUserModalOpen(true)} className="btn btn-primary">
          ➕ Thêm thành viên
        </button>
      </div>

      {/* Filter Component */}
      <MemberFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />

      {/* Members table */}
      <MemberTable
        members={members}
        onViewDetails={handleViewMemberDetails}
        onUpdateRole={handleUpdateMemberRole}
        onToggleStatus={handleToggleMemberStatus}
        auth={auth}
        getAvatarUrl={getAvatarUrl}
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

      {/* Modal - View User Details */}
      {viewingMember && (
        <MemberDetailsModal
          viewingMember={viewingMember}
          onClose={() => setViewingMember(null)}
          getAvatarUrl={getAvatarUrl}
          formatDate={formatDate}
        />
      )}

      {/* Modal - Create User */}
      {isUserModalOpen && (
        <MemberFormModal
          onClose={() => setIsUserModalOpen(false)}
          onSave={handleCreateUser}
          userForm={userForm}
          setUserForm={setUserForm}
        />
      )}
    </div>
  );
}
