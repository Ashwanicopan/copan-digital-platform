import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { formatDate } from "../../utils/helpers";
import { supabase } from "../../lib/supabase";

export default function LeavePage() {
  const { user: CURRENT_USER, canApproveLeave } = useAuth();
  const { leaveRequests, employees, addLeaveRequest, updateLeaveStatus } = useData();
  const [tab, setTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "", from: "", to: "", reason: "" });
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
    const days = Math.ceil((new Date(form.to) - new Date(form.from)) / 86400000) + 1;
    await addLeaveRequest({
      employeeId: CURRENT_USER.id,
      employeeName: CURRENT_USER.name,
      type: form.type,
      from: form.from,
      to: form.to,
      days,
      reason: form.reason,
    });
    setShowModal(false);
    setForm({ type: leaveTypes[0]?.type || "", from: "", to: "", reason: "" });
  }

  return (
    <>
      <Header title="Leave Management" />
      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <h2>Leave Requests</h2>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <i className="fas fa-plus" /> Apply Leave
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
              <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>No leave requests found</td></tr>
                ) : (
                  filtered.map((l) => {
                    const emp = employees.find((e) => e.id === l.employeeId);
                    return (
                      <tr key={l.id}>
                        <td>
                          <div className="employee-cell">
                            <Avatar name={l.employeeName || emp?.name || ""} initials={emp?.avatar || "?"} avatarUrl={emp?.avatarUrl} />
                            <div><div className="name">{l.employeeName || emp?.name}</div></div>
                          </div>
                        </td>
                        <td>{l.type}</td>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Apply for Leave">
        <form onSubmit={handleApply}>
          <div className="form-group">
            <label>Leave Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {leaveTypes.map((t) => <option key={t.id} value={t.type}>{t.type}</option>)}
            </select>
          </div>
          <div className="form-group"><label>From Date</label><input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} required /></div>
          <div className="form-group"><label>To Date</label><input type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} required /></div>
          <div className="form-group"><label>Reason</label><textarea rows="3" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required /></div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Request</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
