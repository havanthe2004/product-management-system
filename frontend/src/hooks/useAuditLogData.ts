import { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/audit-log.service';

export function useAuditLogData(filters?: { search?: string; module?: string; action?: string; email?: string; page?: number; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    const apiParams: any = {};
    if (filters?.search) apiParams.search = filters.search;
    if (filters?.module && filters.module !== 'ALL') apiParams.module = filters.module;
    if (filters?.action && filters.action !== 'ALL') apiParams.action = filters.action;
    if (filters?.email && filters.email !== 'ALL') apiParams.email = filters.email;
    if (filters?.page) apiParams.page = filters.page;
    if (filters?.limit) apiParams.limit = filters.limit;

    try {
      const res = await getAuditLogs(apiParams);
      if (res.success) {
        const data = res.data as any;
        if (Array.isArray(data)) {
          setLogs(data);
          setTotalItems(data.length);
        } else {
          setLogs(data.items || []);
          setTotalItems(data.total || 0);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.search, filters?.module, filters?.action, filters?.email, filters?.page, filters?.limit]);

  return { logs, totalItems, fetchLogs, isLoading };
}
