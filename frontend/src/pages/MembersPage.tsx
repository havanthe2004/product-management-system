import React, { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import * as userService from '../services/user.service';
import { useMemberData } from '../hooks/useMemberData';
import { DEFAULT_AVATAR } from '../layouts/Sidebar';

// Import split components
import MemberTable from '../components/members/MemberTable';
import MemberFormModal from '../components/members/MemberFormModal';
import MemberDetailsModal from '../components/members/MemberDetailsModal';

export default function MembersPage() {
  const auth = useAppSelector((state) => state.auth);

  // Custom hook
  const { members, fetchMembers } = useMemberData();

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
    if (!confirm(`Bạn có muốn đổi quyền của thành viên này sang ${targetRole} không?`)) {
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
    if (!confirm(`Bạn có muốn ${actionMsg} tài khoản thành viên này không?`)) return;
    try {
      await userService.toggleUserStatus(id, nextStatus);
      fetchMembers();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
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

      {/* Members table */}
      <MemberTable
        members={members}
        onViewDetails={setViewingMember}
        onUpdateRole={handleUpdateMemberRole}
        onToggleStatus={handleToggleMemberStatus}
        auth={auth}
        getAvatarUrl={getAvatarUrl}
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
