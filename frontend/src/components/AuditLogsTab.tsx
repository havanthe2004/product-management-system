import { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/audit-log.service';

export default function AuditLogsTab() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await getAuditLogs();
        if (res.success) setLogs(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="fade-in table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Người thực hiện</th>
            <th>Phân hệ</th>
            <th>Hành động</th>
            <th>Chi tiết hoạt động</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
              <td><code>{log.email || 'Hệ thống'}</code></td>
              <td><span className="badge badge-primary">{log.module}</span></td>
              <td>
                <span className={`badge ${
                  log.action.includes('THÊM') || log.action.includes('LOGIN') || log.action.includes('REGISTER') ? 'badge-success' :
                  log.action.includes('CẬP NHẬT') ? 'badge-warning' : 'badge-danger'
                }`}>
                  {log.action}
                </span>
              </td>
              <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div>
                  <strong>{log.description || '-'}</strong>
                  {log.oldData && (
                    <details style={{ marginTop: '6px', cursor: 'pointer' }}>
                      <summary style={{ fontSize: '11px', color: 'var(--primary)' }}>Xem dữ liệu cũ trước khi đổi</summary>
                      <pre style={{ margin: '4px 0 0 0', padding: '8px', fontSize: '11px', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', overflowX: 'auto', borderRadius: '4px' }}>
                        {JSON.stringify(log.oldData, null, 2)}
                      </pre>
                    </details>
                  )}
                  {log.newData && (
                    <details style={{ marginTop: '4px', cursor: 'pointer' }}>
                      <summary style={{ fontSize: '11px', color: 'var(--success)' }}>Xem dữ liệu thay đổi mới nhất</summary>
                      <pre style={{ margin: '4px 0 0 0', padding: '8px', fontSize: '11px', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', overflowX: 'auto', borderRadius: '4px' }}>
                        {JSON.stringify(log.newData, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
