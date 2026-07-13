import api from './api';
import type { BaseResponse, User } from '../types';

export async function getUsers(): Promise<BaseResponse<User[]>> {
  const res = await api.get<BaseResponse<User[]>>('/users');
  return res.data;
}

export async function createUser(data: any): Promise<BaseResponse<User>> {
  const res = await api.post<BaseResponse<User>>('/users', data);
  return res.data;
}

export async function updateUserRole(id: number, roleName: string): Promise<BaseResponse<User>> {
  const res = await api.put<BaseResponse<User>>(`/users/${id}/role`, { roleName });
  return res.data;
}

export async function toggleUserStatus(id: number, status: string): Promise<BaseResponse<User>> {
  const res = await api.put<BaseResponse<User>>(`/users/${id}/status`, { status });
  return res.data;
}
