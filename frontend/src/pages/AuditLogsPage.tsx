import { useState, useEffect, useRef } from 'react';
import { useAuditLogData } from '../hooks/useAuditLogData';
import AuditLogTable from '../components/audit-logs/AuditLogTable';
import AuditLogFilters from '../components/audit-logs/AuditLogFilters';
import * as userService from '../services/user.service';
import Pagination from '../components/common/Pagination';
import { useSearchParams } from 'react-router-dom';

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

  // Pagination states from URL query params
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '10');

  // Custom data hook
  const { logs, totalItems } = useAuditLogData({
    search: searchQuery,
    module: moduleFilter,
    action: actionFilter,
    email: emailFilter,
    page: currentPage,
    limit: pageSize
  });

  // Reset page when filters change (skip initial render to persist F5)
  const prevFilters = useRef({ searchQuery, moduleFilter, actionFilter, emailFilter });
  useEffect(() => {
    const filtersChanged =
      prevFilters.current.searchQuery !== searchQuery ||
      prevFilters.current.moduleFilter !== moduleFilter ||
      prevFilters.current.actionFilter !== actionFilter ||
      prevFilters.current.emailFilter !== emailFilter;

    prevFilters.current = { searchQuery, moduleFilter, actionFilter, emailFilter };

    if (!filtersChanged) return;

    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', '1');
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, moduleFilter, actionFilter, emailFilter]);

  const totalPages = Math.ceil(totalItems / pageSize);

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

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={(page) => {
          setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('page', page.toString());
            return next;
          });
        }}
        onPageSizeChange={(size) => {
          setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('page', '1');
            next.set('pageSize', size.toString());
            return next;
          });
        }}
      />
    </div>
  );
}
