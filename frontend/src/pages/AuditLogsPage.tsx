import { useState, useEffect } from 'react';
import { useAuditLogData } from '../hooks/useAuditLogData';
import AuditLogTable from '../components/audit-logs/AuditLogTable';
import AuditLogFilters from '../components/audit-logs/AuditLogFilters';
import * as userService from '../services/user.service';

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [emailFilter, setEmailFilter] = useState('ALL');
  const [emails, setEmails] = useState<string[]>([]);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await userService.getUsers();
        if (res.success) {
          const list = res.data.map(u => u.email).filter(Boolean) as string[];
          setEmails(Array.from(new Set(list)));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmails();
  }, []);

  const { logs } = useAuditLogData({
    search: searchQuery,
    module: moduleFilter,
    action: actionFilter,
    email: emailFilter
  });

  return (
    <div className="fade-in">
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Nhật ký hoạt động hệ thống</h3>
      
      <AuditLogFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        moduleFilter={moduleFilter}
        setModuleFilter={setModuleFilter}
        actionFilter={actionFilter}
        setActionFilter={setActionFilter}
        emailFilter={emailFilter}
        setEmailFilter={setEmailFilter}
        emails={emails}
      />

      <AuditLogTable logs={logs} />
    </div>
  );
}
