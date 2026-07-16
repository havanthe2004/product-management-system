import { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/audit-log.service';

export function useAuditLogData() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await getAuditLogs();
      if (res.success) setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return { logs, fetchLogs, isLoading };
}
