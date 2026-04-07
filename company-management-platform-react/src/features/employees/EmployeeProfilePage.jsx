import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { formatDate, formatCurrency } from "../../utils/helpers";
import { COMPANY } from "../../data/mockData";
import { supabase } from "../../lib/supabase";

const profileTabs = [
  { id: "overview", label: "Overview", icon: "fa-user" },
  { id: "attendance", label: "Attendance", icon: "fa-clock" },
  { id: "leave", label: "Leave", icon: "fa-calendar-alt" },
  { id: "performance", label: "Performance", icon: "fa-chart-line" },
  { id: "expense", label: "Expense & Travel", icon: "fa-receipt" },
];

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { employees, leaveBalances, leaveRequests, payroll, attendance, departments, locations, updateEmployee, deleteEmployee } = useData();
  const emp = employees.find((e) => e.id === Number(id));
  const [activeTab, setActiveTab] = useState("overview");
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [shifts, setShifts] = useState([]);
  const isAdmin = user?.isAdmin;

  useEffect(() => {
    supabase.from("shifts").select("*").order("start_time").then(({ data }) => { if (data) setShifts(data); });
  }, []);

  if (!emp) return <><Header title="Employee Profile" /><div className="page-content"><p>Employee not found.</p></div></>;

  const payrollEntry = payroll.find((p) => p.employeeId === emp.id);
  const designations = COMPANY.designations || {};

  function openEdit() {
    setEditForm({
      name: emp.name || "", email: emp.email || "", phone: emp.phone || "", dob: emp.dob || "",
      department: emp.department || "", designation: emp.designation || "", location: emp.location || "",
      joinDate: emp.joinDate || "", managerId: emp.managerId ? String(emp.managerId) : "",
      salary: emp.salary || "", paymentMode: emp.paymentMode || "Bank Transfer",
      bankName: emp.bankName || "", bankAccount: emp.bankAccount || "",
      pan: emp.pan || "", uan: emp.uan || "", status: emp.status || "active",
      shiftId: emp.shiftId ? String(emp.shiftId) : "",
    });
    setShowEdit(true);
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    await updateEmployee(emp.id, {
      ...editForm,
      managerId: editForm.managerId ? Number(editForm.managerId) : null,
      salary: Number(editForm.salary) || 0,
      shiftId: editForm.shiftId ? Number(editForm.shiftId) : null,
    });
    setShowEdit(false);
  }

  async function handleDelete() {
    await deleteEmployee(emp.id);
    navigate("/employees");
  }

  const currentDesignations = designations[editForm.department] || [];

  return (
    <>
      <Header title="Employee Profile" />
      <div className="page-content">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <button className="btn btn-outline" onClick={() => navigate("/employees")}>
            <i className="fas fa-arrow-left" /> Back to Employees
          </button>
          {isAdmin && (
            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm" onClick={openEdit}><i className="fas fa-edit" /> Edit</button>
              <button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => setShowDelete(true)}><i className="fas fa-trash" /> Remove</button>
            </div>
          )}
        </div>

        <div className="profile-header">
          <Avatar name={emp.name} initials={emp.avatar} avatarUrl={emp.avatarUrl} size="lg" />
          <div className="profile-info">
            <h2>{emp.name}</h2>
            <div className="designation">{emp.designation} {emp.department ? `· ${emp.department}` : ""}</div>
            <Badge status={emp.status} />
          </div>
        </div>

        <div className="tabs" style={{ marginTop: 20, marginBottom: 20 }}>
          {profileTabs.map((t) => (
            <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
              <i className={`fas ${t.icon}`} style={{ marginRight: 6 }} />{t.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && <OverviewTab emp={emp} payrollEntry={payrollEntry} shifts={shifts} />}
        {activeTab === "attendance" && <AttendanceTab emp={emp} attendance={attendance} />}
        {activeTab === "leave" && <LeaveTab emp={emp} leaveRequests={leaveRequests} leaveBalances={leaveBalances} />}
        {activeTab === "performance" && <PerformanceTab emp={emp} attendance={attendance} />}
        {activeTab === "expense" && <ExpenseTab emp={emp} />}
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620, padding: 0, overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ padding: "24px 28px 18px", borderBottom: "1px solid var(--gray-100)" }}>
              <h3 style={{ margin: 0 }}><i className="fas fa-edit" style={{ marginRight: 8, color: "var(--primary)" }} />Edit Employee</h3>
            </div>
            <form onSubmit={handleSaveEdit} style={{ padding: "24px 28px" }}>
              <h4 style={{ fontSize: "0.82rem", color: "var(--gray-500)", marginBottom: 12 }}>Personal Details</h4>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group"><label>Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required /></div>
                <div className="form-group"><label>Phone</label><input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group"><label>Date of Birth</label><input type="date" value={editForm.dob} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} /></div>
                <div className="form-group"><label>Date of Joining</label><input type="date" value={editForm.joinDate} onChange={(e) => setEditForm({ ...editForm, joinDate: e.target.value })} /></div>
              </div>

              <h4 style={{ fontSize: "0.82rem", color: "var(--gray-500)", margin: "20px 0 12px", paddingTop: 16, borderTop: "1px solid var(--gray-100)" }}>Employment Details</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>Department</label>
                  <select value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value, designation: (designations[e.target.value] || [])[0] || editForm.designation })}>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <select value={editForm.designation} onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}>
                    {currentDesignations.map((d) => <option key={d} value={d}>{d}</option>)}
                    {!currentDesignations.includes(editForm.designation) && editForm.designation && <option value={editForm.designation}>{editForm.designation}</option>}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>Location</label>
                  <select value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}>
                    {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="on-leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>Shift</label>
                  <select value={editForm.shiftId} onChange={(e) => setEditForm({ ...editForm, shiftId: e.target.value })}>
                    <option value="">Select Shift</option>
                    {shifts.map((s) => {
                      const fmt = (t) => { const [h,m] = t.split(":"); const hr = parseInt(h); return `${hr > 12 ? hr-12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`; };
                      return <option key={s.id} value={s.id}>{s.name} ({fmt(s.start_time)} - {fmt(s.end_time)})</option>;
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label>Reporting Manager</label>
                  <select value={editForm.managerId} onChange={(e) => setEditForm({ ...editForm, managerId: e.target.value })}>
                    <option value="">No Manager</option>
                    {employees.filter((e) => e.id !== emp.id).map((e) => <option key={e.id} value={e.id}>{e.name} — {e.designation}</option>)}
                  </select>
                </div>
              </div>

              <h4 style={{ fontSize: "0.82rem", color: "var(--gray-500)", margin: "20px 0 12px", paddingTop: 16, borderTop: "1px solid var(--gray-100)" }}>Salary & Bank</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group"><label>Monthly CTC (₹)</label><input type="number" min="0" value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} /></div>
                <div className="form-group">
                  <label>Payment Mode</label>
                  <select value={editForm.paymentMode} onChange={(e) => setEditForm({ ...editForm, paymentMode: e.target.value })}>
                    <option value="Bank Transfer">Bank Transfer</option><option value="Cheque">Cheque</option><option value="Cash">Cash</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group"><label>Bank Name</label><input type="text" value={editForm.bankName} onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })} /></div>
                <div className="form-group"><label>Bank Account</label><input type="text" value={editForm.bankAccount} onChange={(e) => setEditForm({ ...editForm, bankAccount: e.target.value })} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group"><label>PAN</label><input type="text" value={editForm.pan} onChange={(e) => setEditForm({ ...editForm, pan: e.target.value.toUpperCase() })} maxLength={10} /></div>
                <div className="form-group"><label>UAN</label><input type="text" value={editForm.uan} onChange={(e) => setEditForm({ ...editForm, uan: e.target.value })} /></div>
              </div>

              <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--gray-100)" }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowEdit(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--danger-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: "1.5rem", color: "var(--danger)" }} />
              </div>
              <h3 style={{ margin: "0 0 8px" }}>Remove Employee</h3>
              <p style={{ color: "var(--gray-500)", fontSize: "0.88rem", margin: 0 }}>
                Are you sure you want to remove <strong>{emp.name}</strong>? This will delete all their attendance, leave records, and cannot be undone.
              </p>
            </div>
            <div className="flex gap-2" style={{ justifyContent: "center", marginTop: 24 }}>
              <button className="btn btn-outline" onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ background: "var(--danger)", borderColor: "var(--danger)" }} onClick={handleDelete}>
                <i className="fas fa-trash" /> Remove Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function OverviewTab({ emp, payrollEntry, shifts }) {
  const empShift = (shifts || []).find((s) => s.id === emp.shiftId);
  const fmtT = (t) => { if (!t) return ""; const [h,m] = t.split(":"); const hr = parseInt(h); return `${hr > 12 ? hr-12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`; };
  const fmtBreak = (mins) => { if (!mins) return "No break"; if (mins < 60) return `${mins} min`; const h = Math.floor(mins / 60); const m = mins % 60; return m > 0 ? `${h}h ${m}m` : `${h}h`; };
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const DAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <>
      <div className="profile-details-grid">
        <div className="card">
          <div className="card-header"><h2>Personal Information</h2></div>
          {[["Employee ID", emp.employeeId], ["Email", emp.email], ["Phone", emp.phone || "—"], ["Location", emp.location || "—"], ["Date of Birth", emp.dob ? formatDate(emp.dob) : "—"], ["Join Date", emp.joinDate ? formatDate(emp.joinDate) : "—"]].map(([l, v]) => (
            <div className="detail-item mb-4" key={l}><span className="detail-label">{l}</span><span className="detail-value">{v}</span></div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><h2>Employment Details</h2></div>
          {[["Department", emp.department || "—"], ["Designation", emp.designation || "—"], ["Reporting Manager", emp.manager || "—"], ["Monthly CTC", emp.salary ? formatCurrency(emp.salary) : "—"]].map(([l, v]) => (
            <div className="detail-item mb-4" key={l}><span className="detail-label">{l}</span><span className="detail-value">{v}</span></div>
          ))}
        </div>
      </div>

      {/* Shift Details */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h2><i className="fas fa-clock" style={{ marginRight: 8, color: "var(--primary)" }} />Shift Details</h2></div>
        {empShift ? (
          <div style={{ padding: "0 20px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--gray-900)" }}>{empShift.name}</span>
              {empShift.is_default && <span style={{ background: "var(--primary)", color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: "0.68rem", fontWeight: 600 }}>DEFAULT</span>}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              {[
                ["Start Time", fmtT(empShift.start_time), "fa-sign-in-alt", "var(--success)"],
                ["End Time", fmtT(empShift.end_time), "fa-sign-out-alt", "var(--danger)"],
                ["Break", fmtBreak(empShift.break_minutes), "fa-coffee", "var(--warning)"],
                ["Grace Period", `${empShift.grace_minutes} min`, "fa-hourglass-half", "var(--info)"],
              ].map(([label, value, icon, color]) => (
                <div key={label} style={{ flex: 1, minWidth: 130, padding: "14px 16px", background: "var(--gray-50)", borderRadius: 10, border: "1px solid var(--gray-100)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <i className={`fas ${icon}`} style={{ fontSize: "0.75rem", color }} />
                    <span style={{ fontSize: "0.72rem", color: "var(--gray-500)" }}>{label}</span>
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--gray-900)" }}>{value}</div>
                </div>
              ))}
            </div>
            <div>
              <span style={{ fontSize: "0.78rem", color: "var(--gray-500)", marginRight: 10 }}>Weekly Schedule:</span>
              <div style={{ display: "inline-flex", gap: 4, marginTop: 4 }}>
                {DAYS.map((day, i) => {
                  const isOff = (empShift.weekly_off || []).includes(DAY_FULL[i]);
                  return (
                    <span key={day} style={{
                      fontSize: "0.72rem", fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                      background: isOff ? "var(--danger-bg)" : "var(--success-bg)",
                      color: isOff ? "var(--danger)" : "var(--success)",
                      border: `1px solid ${isOff ? "var(--danger)" : "var(--success)"}`,
                    }}>
                      {day} {isOff ? "OFF" : ""}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--gray-400)" }}>No shift assigned</div>
        )}
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h2>Bank & Payment Details</h2></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[["Payment Mode", emp.paymentMode || "Bank Transfer"], ["Bank Name", emp.bankName || "—"], ["Bank Account", emp.bankAccount || "—"], ["PAN", emp.pan || "—"], ["UAN", emp.uan || "—"]].map(([l, v]) => (
            <div className="detail-item" key={l} style={{ padding: "12px 0" }}><span className="detail-label">{l}</span><span className="detail-value">{v}</span></div>
          ))}
        </div>
      </div>
      {payrollEntry && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header"><h2>Last Payslip - {payrollEntry.month}</h2></div>
          <div className="table-container">
            <table>
              <thead><tr><th>Basic</th><th>HRA</th><th>Allowances</th><th>Deductions</th><th>Tax</th><th>Net Pay</th></tr></thead>
              <tbody><tr>
                <td className="salary-cell">{formatCurrency(payrollEntry.basic)}</td>
                <td className="salary-cell">{formatCurrency(payrollEntry.hra)}</td>
                <td className="salary-cell">{formatCurrency(payrollEntry.specialAllowance + payrollEntry.conveyance + payrollEntry.medical)}</td>
                <td className="salary-cell" style={{ color: "var(--danger)" }}>{formatCurrency(payrollEntry.pfEmployee + payrollEntry.professionalTax)}</td>
                <td className="salary-cell" style={{ color: "var(--danger)" }}>{formatCurrency(payrollEntry.tds)}</td>
                <td className="salary-cell font-semibold">{formatCurrency(payrollEntry.netPay)}</td>
              </tr></tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function AttendanceTab({ emp, attendance }) {
  const now = new Date();
  const monthAtt = attendance.filter((a) => { if (a.employeeId !== emp.id) return false; const d = new Date(a.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).sort((a, b) => b.date.localeCompare(a.date));
  const present = monthAtt.filter((a) => a.status === "present").length;
  const absent = monthAtt.filter((a) => a.status === "absent").length;
  const totalH = monthAtt.reduce((s, a) => s + (a.hours || 0), 0);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return (
    <>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[{ l: "Present", v: present, c: "var(--success)" }, { l: "Absent", v: absent, c: "var(--danger)" }, { l: "Total Hours", v: totalH.toFixed(1) + "h", c: "var(--primary)" }, { l: "Avg Hours", v: present > 0 ? (totalH / present).toFixed(1) + "h" : "0h", c: "var(--gray-900)" }].map((s) => (
          <div key={s.l} className="stat-card" style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: "1.5rem", fontWeight: 700, color: s.c }}>{s.v}</div><div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{s.l}</div></div>
        ))}
      </div>
      <div className="card">
        <div className="card-header"><h2>Attendance - {months[now.getMonth()]} {now.getFullYear()}</h2></div>
        <div className="table-container"><table><thead><tr><th>Date</th><th>Day</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Status</th></tr></thead>
          <tbody>{monthAtt.length === 0 ? <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>No records</td></tr> : monthAtt.map((a, i) => (
            <tr key={i}><td>{formatDate(a.date)}</td><td>{new Date(a.date).toLocaleDateString("en-IN", { weekday: "short" })}</td><td>{a.clockIn || "—"}</td><td>{a.clockOut || "—"}</td><td>{a.hours ? a.hours + "h" : "—"}</td><td><Badge status={a.status} /></td></tr>
          ))}</tbody></table></div>
      </div>
    </>
  );
}

function LeaveTab({ emp, leaveRequests, leaveBalances }) {
  const empLeaves = leaveRequests.filter((l) => l.employeeId === emp.id).sort((a, b) => (b.appliedOn || "").localeCompare(a.appliedOn || ""));
  const empBal = leaveBalances.filter((l) => l.employeeId === emp.id);
  return (
    <>
      {empBal.length > 0 && <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>{empBal.map((b) => (<div key={b.type} className="stat-card" style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primary)" }}>{b.balance}</div><div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{b.type}</div></div>))}</div>}
      <div className="card"><div className="card-header"><h2>Leave History</h2></div>
        <div className="table-container"><table><thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th></tr></thead>
          <tbody>{empLeaves.length === 0 ? <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>No leave requests</td></tr> : empLeaves.map((l) => (
            <tr key={l.id}><td><strong>{l.type}</strong></td><td>{formatDate(l.from)}</td><td>{formatDate(l.to)}</td><td>{l.days}</td><td className="text-sm">{l.reason}</td><td><Badge status={l.status} /></td></tr>
          ))}</tbody></table></div>
      </div>
    </>
  );
}

function PerformanceTab({ emp, attendance }) {
  const now = new Date();
  const last30 = attendance.filter((a) => { if (a.employeeId !== emp.id) return false; const diff = (now - new Date(a.date)) / 86400000; return diff >= 0 && diff <= 30; });
  const present = last30.filter((a) => a.status === "present").length;
  const totalH = last30.reduce((s, a) => s + (a.hours || 0), 0);
  const avgH = present > 0 ? (totalH / present).toFixed(1) : "0";
  const late = last30.filter((a) => { if (!a.clockIn) return false; const [h] = a.clockIn.split(":").map(Number); return h >= 10; }).length;
  const attRate = Math.round((present / 22) * 100);
  const punctRate = present > 0 ? Math.round(((present - late) / present) * 100) : 0;
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[{ l: "Attendance", v: `${attRate}%`, i: "fa-user-check", c: attRate >= 90 ? "var(--success)" : attRate >= 75 ? "var(--warning)" : "var(--danger)" }, { l: "Punctuality", v: `${punctRate}%`, i: "fa-clock", c: punctRate >= 90 ? "var(--success)" : "var(--warning)" }, { l: "Avg Hours", v: `${avgH}h`, i: "fa-hourglass-half", c: Number(avgH) >= 8 ? "var(--success)" : "var(--warning)" }, { l: "Late", v: late, i: "fa-exclamation-triangle", c: late <= 2 ? "var(--success)" : "var(--danger)" }].map((m) => (
          <div key={m.l} className="card" style={{ padding: 20, textAlign: "center" }}><i className={`fas ${m.i}`} style={{ fontSize: "1.5rem", color: m.c, marginBottom: 8 }} /><div style={{ fontSize: "1.8rem", fontWeight: 700, color: m.c }}>{m.v}</div><div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: 4 }}>{m.l}</div></div>
        ))}
      </div>
      <div className="card"><div className="card-header"><h2>Last 30 Days</h2></div><div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        {[{ l: "Attendance", v: attRate, c: "var(--success)" }, { l: "Punctuality", v: punctRate, c: "var(--primary)" }, { l: "Hours", v: Math.min(100, Math.round((Number(avgH) / 8) * 100)), c: "var(--info)" }].map((b) => (
          <div key={b.l}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.85rem" }}><span style={{ fontWeight: 500 }}>{b.l}</span><span style={{ fontWeight: 600, color: b.c }}>{b.v}%</span></div><div style={{ background: "var(--gray-100)", borderRadius: 8, height: 10, overflow: "hidden" }}><div style={{ width: `${b.v}%`, height: "100%", background: b.c, borderRadius: 8 }} /></div></div>
        ))}
      </div></div>
    </>
  );
}

function ExpenseTab() {
  return (
    <div className="card"><div className="card-header"><h2>Expense & Travel Claims</h2></div>
      <div className="table-container"><table><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody><tr><td colSpan={5} style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}><i className="fas fa-receipt" style={{ fontSize: "2rem", marginBottom: 8, display: "block", opacity: 0.3 }} />No claims yet</td></tr></tbody></table></div>
    </div>
  );
}
