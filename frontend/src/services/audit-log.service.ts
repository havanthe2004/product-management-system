import api from './api';
import type { BaseResponse, AuditLog } from '../types';

export async function getAuditLogs(): Promise<BaseResponse<AuditLog[]>> {
  const res = await api.get<BaseResponse<AuditLog[]>>('/audit-logs');
  return res.data;
}
