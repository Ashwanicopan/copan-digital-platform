import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useData } from "../../../context/DataContext";
import { formatDate } from "../../../utils/helpers";

const actionColors = {
  create: { bg: "var(--success-bg)", color: "var(--success)" },
  update: { bg: "var(--primary-bg)", color: "var(--primary)" },
  delete: { bg: "var(--danger-bg)", color: "var(--danger)" },
  login: { bg: "var(--info-bg, #ecfeff)", color: "var(--info)" },
  approve: { bg: "var(--success-bg)", color: "var(--success)" },
  reject: { bg: "var(--danger-bg)", color: "var(--danger)" },
};

export default function AuditLogSettings() {
  const { employees } = useData();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => {
      if (data) setLogs(data);
    });
  }, []);

  const filtered = filter ? logs.filter((l) => l.action === filter) : logs;

  return (
    <div className="card">
      <div className="card-header">
        <h2>Audit Logs</h2>
        <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
        </select>
      </div>
      <div className="table-container">
        <table>
          <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>
                <i className="fas fa-history" style={{ fontSize: "2rem", marginBottom: 8, display: "block", opacity: 0.3 }} />
                No audit logs yet. Actions will be recorded as users interact with the system.
              </td></tr>
            ) : (
              filtered.map((log) => {
                const emp = employees.find((e) => e.id === log.user_id);
                const style = actionColors[log.action] || { bg: "var(--gray-100)", color: "var(--gray-600)" };
                return (
                  <tr key={log.id}>
                    <td className="text-sm">{new Date(log.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    <td><strong>{emp?.name || "System"}</strong></td>
                    <td><span style={{ background: style.bg, color: style.color, padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase" }}>{log.action}</span></td>
                    <td>{log.entity}</td>
                    <td className="text-sm text-muted">{log.details ? JSON.stringify(log.details).substring(0, 80) : "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
