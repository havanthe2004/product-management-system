import axios from 'axios';
import api from './api';
import type { BaseResponse, LoginResponse, RefreshTokenResponse } from '../types';

export async function refreshToken(token: string): Promise<BaseResponse<RefreshTokenResponse>> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  const res = await axios.post<BaseResponse<RefreshTokenResponse>>(`${baseUrl}/auth/refresh`, { refreshToken: token });
  return res.data;
}

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
