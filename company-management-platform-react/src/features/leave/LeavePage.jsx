import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { formatDate } from "../../utils/helpers";
import { supabase } from "../../lib/supabase";

const leaveModeLabels = {
  "full-day": "Full Day",
  "half-day-first": "Half Day (1st Half)",
  "half-day-second": "Half Day (2nd Half)",
  "wfh": "Work From Home",
};

const leaveModeColors = {
  "full-day": { bg: "var(--primary-bg)", color: "var(--primary)" },
  "half-day-first": { bg: "var(--warning-bg)", color: "var(--warning)" },
  "half-day-second": { bg: "var(--warning-bg)", color: "var(--warning)" },
  "wfh": { bg: "var(--info-bg, #ecfeff)", color: "var(--info)" },
};

export default function LeavePage() {
  const { user: CURRENT_USER, canApproveLeave } = useAuth();
  const { leaveRequests, employees, addLeaveRequest, updateLeaveStatus } = useData();
  const [tab, setTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "", from: "", to: "", reason: "", leaveMode: "full-day" });
  const [leaveTypes, setLeaveTypes] = useState([]);

  useEffect(() => {
    supabase.from("leave_policies").select("id, type").order("id").then(({ data }) => {
      if (data) {
        setLeaveTypes(data);
        if (data.length > 0) setForm((f) => ({ ...f, type: data[0].type }));
      }
    });
  }, []);

  const filtered = tab === "all" ? leaveRequests : leaveRequests.filter((l) => l.status === tab);

  async function handleAction(id, status) {
    await updateLeaveStatus(id, status);
  }

  async function handleApply(e) {
    e.preventDefault();
    let days;
    if (form.leaveMode === "half-day-first" || form.leaveMode === "half-day-second") {
      days = 0.5;
    } else if (form.leaveMode === "wfh") {
      days = 0; // WFH doesn't deduct leave
    } else {
      days = Math.ceil((new Date(form.to) - new Date(form.from)) / 86400000) + 1;
    }
    await addLeaveRequest({
      employeeId: CURRENT_USER.id,
      employeeName: CURRENT_USER.name,
      type: form.leaveMode === "wfh" ? "Work From Home" : form.type,
      from: form.from,
      to: form.leaveMode.startsWith("half-day") ? form.from : form.to,
      days,
      reason: form.reason,
      leaveMode: form.leaveMode,
    });
    setShowModal(false);
    setForm({ type: leaveTypes[0]?.type || "", from: "", to: "", reason: "", leaveMode: "full-day" });
  }

  return (
    <>
      <Header title="Leave Management" />
      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <h2>Leave Requests</h2>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <i className="fas fa-plus" /> Apply Leave / WFH
            </button>
          </div>

          <div className="tabs">
            {["all", "pending", "approved", "rejected"].map((t) => (
              <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {t === "pending" && leaveRequests.filter((l) => l.status === "pending").length > 0 && (
                  <span style={{ marginLeft: 6, background: "var(--warning)", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: "0.7rem" }}>
                    {leaveRequests.filter((l) => l.status === "pending").length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="table-container">
            <table>
              <thead><tr><th>Employee</th><th>Type</th><th>Mode</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>No leave requests found</td></tr>
                ) : (
                  filtered.map((l) => {
                    const emp = employees.find((e) => e.id === l.employeeId);
                    const mode = l.leaveMode || "full-day";
                    const modeStyle = leaveModeColors[mode] || leaveModeColors["full-day"];
                    return (
                      <tr key={l.id}>
                        <td>
                          <div className="employee-cell">
                            <Avatar name={l.employeeName || emp?.name || ""} initials={emp?.avatar || "?"} avatarUrl={emp?.avatarUrl} />
                            <div><div className="name">{l.employeeName || emp?.name}</div></div>
                          </div>
                        </td>
                        <td>{l.type}</td>
                        <td>
                          <span style={{ background: modeStyle.bg, color: modeStyle.color, padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 600 }}>
                            {leaveModeLabels[mode] || mode}
                          </span>
                        </td>
                        <td>{formatDate(l.from)}</td>
                        <td>{formatDate(l.to)}</td>
                        <td>{l.days}</td>
                        <td className="text-sm">{l.reason}</td>
                        <td><Badge status={l.status} /></td>
                        <td>
                          {l.status === "pending" && canApproveLeave(l.employeeId) ? (
                            <div className="leave-actions">
                              <button className="btn-approve" onClick={() => handleAction(l.id, "approved")}>Approve</button>
                              <button className="btn-reject" onClick={() => handleAction(l.id, "rejected")}>Reject</button>
                            </div>
                          ) : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Apply for Leave / WFH">
        <form onSubmit={handleApply}>
          {/* Mode Selector */}
          <div className="form-group">
            <label>Request Type</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
              {[
                { value: "full-day", label: "Full Day Leave", icon: "fa-calendar-day", color: "var(--primary)" },
                { value: "half-day-first", label: "Half Day (1st Half)", icon: "fa-adjust", color: "var(--warning)" },
                { value: "half-day-second", label: "Half Day (2nd Half)", icon: "fa-adjust", color: "var(--warning)" },
                { value: "wfh", label: "Work From Home", icon: "fa-home", color: "var(--info)" },
              ].map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setForm({ ...form, leaveMode: m.value })}
                  style={{
                    padding: "12px", borderRadius: 10, border: `2px solid ${form.leaveMode === m.value ? m.color : "var(--gray-200)"}`,
                    background: form.leaveMode === m.value ? `${m.color}10` : "#fff",
                    cursor: "pointer", textAlign: "center", transition: "all 0.15s",
                  }}
                >
                  <i className={`fas ${m.icon}`} style={{ fontSize: "1.1rem", color: form.leaveMode === m.value ? m.color : "var(--gray-400)", display: "block", marginBottom: 4 }} />
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: form.leaveMode === m.value ? m.color : "var(--gray-600)" }}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {form.leaveMode !== "wfh" && (
            <div className="form-group">
              <label>Leave Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {leaveTypes.map((t) => <option key={t.id} value={t.type}>{t.type}</option>)}
              </select>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: form.leaveMode.startsWith("half-day") ? "1fr" : "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label>{form.leaveMode.startsWith("half-day") ? "Date" : "From Date"}</label>
              <input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value, to: form.leaveMode.startsWith("half-day") ? e.target.value : form.to })} required />
            </div>
            {!form.leaveMode.startsWith("half-day") && (
              <div className="form-group">
                <label>To Date</label>
                <input type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} required min={form.from} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Reason</label>
            <textarea rows="2" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder={form.leaveMode === "wfh" ? "e.g. Working on design deliverable from home" : "e.g. Personal work, medical appointment"} required />
          </div>

          {/* Summary */}
          <div style={{ padding: 12, background: "var(--gray-50)", borderRadius: 8, fontSize: "0.82rem", color: "var(--gray-600)", marginBottom: 12 }}>
            <i className="fas fa-info-circle" style={{ marginRight: 6, color: "var(--primary)" }} />
            {form.leaveMode === "wfh" ? "WFH requests don't deduct leave balance" :
             form.leaveMode.startsWith("half-day") ? "Half day deducts 0.5 day from leave balance" :
             "Full day leave deducts from your leave balance"}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <i className={`fas ${form.leaveMode === "wfh" ? "fa-home" : "fa-paper-plane"}`} /> {form.leaveMode === "wfh" ? "Request WFH" : "Submit Leave"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
