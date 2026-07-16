import { useAuditLogData } from '../hooks/useAuditLogData';
import AuditLogTable from '../components/audit-logs/AuditLogTable';

export default function AuditLogsPage() {
  const { logs } = useAuditLogData();

  return (
    <div>
      <h3 style={{ margin: '0 0 16px 0' }}>Nhật ký hoạt động hệ thống</h3>
      <AuditLogTable logs={logs} />
    </div>
  );
}
