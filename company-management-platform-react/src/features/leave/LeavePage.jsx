import { useState } from "react";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { formatDate } from "../../utils/helpers";

export default function LeavePage() {
  const { user: CURRENT_USER, canApproveLeave } = useAuth();
  const { leaveRequests, leaveBalances, employees, addLeaveRequest, updateLeaveStatus } = useData();
  const [tab, setTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "Casual Leave", from: "", to: "", reason: "" });

  const userLeave = leaveBalances.filter((l) => l.employeeId === CURRENT_USER.id);
  const casualBal = userLeave.find((l) => l.type === "Casual Leave")?.balance ?? 10;
  const sickBal = userLeave.find((l) => l.type === "Sick Leave")?.balance ?? 7;
  const earnedBal = userLeave.find((l) => l.type === "Earned Leave")?.balance ?? 15;
  const compOffBal = userLeave.find((l) => l.type === "Comp Off")?.balance ?? 2;

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
      ...form,
      days,
    });
    setShowModal(false);
    setForm({ type: "Casual Leave", from: "", to: "", reason: "" });
  }

  return (
    <>
      <Header title="Leave Management" />
      <div className="page-content">
        <div className="leave-balance-grid">
          {[
            { label: "Casual Leave", count: casualBal, total: 12 },
            { label: "Sick Leave", count: sickBal, total: 7 },
            { label: "Earned Leave", count: earnedBal, total: 18 },
            { label: "Comp Off", count: compOffBal, total: null },
          ].map((b) => (
            <div className="leave-balance-card" key={b.label}>
              <div className="leave-type">{b.label}</div>
              <div className="leave-count">{b.count}</div>
              <div className="leave-total">{b.total ? `of ${b.total} remaining` : "available"}</div>
            </div>
          ))}
        </div>

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
              </button>
            ))}
          </div>

          <div className="table-container">
            <table>
              <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((l) => {
                  const emp = employees.find((e) => e.id === l.employeeId);
                  return (
                    <tr key={l.id}>
                      <td>
                        <div className="employee-cell">
                          <Avatar name={l.employeeName} initials={emp?.avatar || "?"} />
                          <div><div className="name">{l.employeeName}</div></div>
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
                })}
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
              {["Casual Leave", "Sick Leave", "Earned Leave", "Comp Off"].map((t) => <option key={t}>{t}</option>)}
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
