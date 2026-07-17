import { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/audit-log.service';

export function useAuditLogData(filters?: { search?: string; module?: string; action?: string; email?: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    const apiParams: any = {};
    if (filters?.search) apiParams.search = filters.search;
    if (filters?.module && filters.module !== 'ALL') apiParams.module = filters.module;
    if (filters?.action && filters.action !== 'ALL') apiParams.action = filters.action;
    if (filters?.email && filters.email !== 'ALL') apiParams.email = filters.email;

    try {
      const res = await getAuditLogs(apiParams);
      if (res.success) setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.search, filters?.module, filters?.action, filters?.email]);

  return { logs, fetchLogs, isLoading };
}
