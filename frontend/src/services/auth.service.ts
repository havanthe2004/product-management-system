import api from './api';
import type { BaseResponse, LoginResponse } from '../types';

export async function login(email: string, password: string): Promise<BaseResponse<LoginResponse>> {
  const res = await api.post<BaseResponse<LoginResponse>>('/auth/login', { email, password });
  return res.data;
}

export async function forgotPassword(email: string): Promise<BaseResponse<any>> {
  const res = await api.post<BaseResponse<any>>('/auth/forgot-password', { email });
  return res.data;
}

export async function resetPassword(data: any): Promise<BaseResponse<any>> {
  const res = await api.post<BaseResponse<any>>('/auth/reset-password', data);
  return res.data;
}
