import api from './api';
import type { BaseResponse, User } from '../types';

export async function getProfile(): Promise<BaseResponse<User>> {
  const res = await api.get<BaseResponse<User>>('/profile');
  return res.data;
}

export async function updateProfile(data: {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  avatar?: string | null;
}): Promise<BaseResponse<User>> {
  const res = await api.put<BaseResponse<User>>('/profile', data);
  return res.data;
}

export async function changePassword(data: any): Promise<BaseResponse<any>> {
  const res = await api.put<BaseResponse<any>>('/profile/change-password', data);
  return res.data;
}
