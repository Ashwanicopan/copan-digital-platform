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
  { id: "onboarding", label: "Onboarding", icon: "fa-clipboard-list" },
  { id: "documents", label: "Documents", icon: "fa-folder-open" },
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
        {activeTab === "leave" && <LeaveTab emp={emp} leaveRequests={leaveRequests} leaveBalances={leaveBalances} isAdmin={isAdmin} />}
        {activeTab === "performance" && <PerformanceTab emp={emp} attendance={attendance} isAdmin={isAdmin} />}
        {activeTab === "expense" && <ExpenseTab emp={emp} />}
        {activeTab === "onboarding" && <OnboardingTab emp={emp} isAdmin={isAdmin} />}
        {activeTab === "documents" && <DocumentsTab emp={emp} isAdmin={isAdmin} />}
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

function LeaveTab({ emp, leaveRequests, leaveBalances, isAdmin }) {
  const [showAllocate, setShowAllocate] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [allocForm, setAllocForm] = useState({ leaveType: "", days: "", action: "add", reason: "" });

  const empLeaves = leaveRequests.filter((l) => l.employeeId === emp.id).sort((a, b) => (b.appliedOn || "").localeCompare(a.appliedOn || ""));
  const empBal = leaveBalances.filter((l) => l.employeeId === emp.id);

  useEffect(() => {
    supabase.from("leave_policies").select("id, type, total_days").order("id").then(({ data }) => {
      if (data) {
        setLeaveTypes(data);
        if (data.length > 0) setAllocForm((f) => ({ ...f, leaveType: String(data[0].id) }));
      }
    });
    // Fetch fresh balances for this employee
    supabase.from("leave_balances").select("*").eq("employee_id", emp.id).eq("year", new Date().getFullYear()).then(({ data }) => {
      if (data) setBalances(data);
    });
  }, [emp.id]);

  async function handleAllocate(e) {
    e.preventDefault();
    const policyId = Number(allocForm.leaveType);
    const days = Number(allocForm.days);
    if (!policyId || !days) return;

    const year = new Date().getFullYear();
    const existing = balances.find((b) => b.leave_policy_id === policyId && b.year === year);

    if (existing) {
      const newBalance = allocForm.action === "add" ? Number(existing.balance) + days : Math.max(0, Number(existing.balance) - days);
      await supabase.from("leave_balances").update({ balance: newBalance }).eq("id", existing.id);
    } else {
      await supabase.from("leave_balances").insert({
        employee_id: emp.id, leave_policy_id: policyId,
        balance: allocForm.action === "add" ? days : 0,
        used: 0, year,
      });
    }

    // Refresh balances
    const { data } = await supabase.from("leave_balances").select("*").eq("employee_id", emp.id).eq("year", new Date().getFullYear());
    if (data) setBalances(data);
    setShowAllocate(false);
    setAllocForm({ leaveType: leaveTypes[0] ? String(leaveTypes[0].id) : "", days: "", action: "add", reason: "" });
  }

  function getTypeName(policyId) {
    const lt = leaveTypes.find((t) => t.id === policyId);
    return lt?.type || "—";
  }

  return (
    <>
      {/* Leave Balances */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h2>Leave Balances — {new Date().getFullYear()}</h2>
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAllocate(true)}>
              <i className="fas fa-plus" /> Allocate Leaves
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 12, padding: "0 20px 20px", flexWrap: "wrap" }}>
          {balances.length > 0 ? balances.map((b) => (
            <div key={b.id} style={{ flex: 1, minWidth: 120, padding: "16px", background: "var(--gray-50)", borderRadius: 10, border: "1px solid var(--gray-100)", textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--primary)" }}>{Number(b.balance)}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--gray-500)", marginTop: 2 }}>{getTypeName(b.leave_policy_id)}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--gray-400)", marginTop: 4 }}>Used: {Number(b.used)}</div>
            </div>
          )) : leaveTypes.map((lt) => (
            <div key={lt.id} style={{ flex: 1, minWidth: 120, padding: "16px", background: "var(--gray-50)", borderRadius: 10, border: "1px dashed var(--gray-200)", textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--gray-300)" }}>0</div>
              <div style={{ fontSize: "0.78rem", color: "var(--gray-400)", marginTop: 2 }}>{lt.type}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--gray-300)", marginTop: 4 }}>Not allocated</div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave History */}
      <div className="card">
        <div className="card-header"><h2>Leave History</h2></div>
        <div className="table-container"><table><thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th></tr></thead>
          <tbody>{empLeaves.length === 0 ? <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>No leave requests</td></tr> : empLeaves.map((l) => (
            <tr key={l.id}><td><strong>{l.type}</strong></td><td>{formatDate(l.from)}</td><td>{formatDate(l.to)}</td><td>{l.days}</td><td className="text-sm">{l.reason}</td><td><Badge status={l.status} /></td></tr>
          ))}</tbody></table></div>
      </div>

      {/* Allocate Modal */}
      {showAllocate && (
        <div className="modal-overlay" onClick={() => setShowAllocate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <h3><i className="fas fa-calendar-plus" style={{ marginRight: 8, color: "var(--primary)" }} />Allocate Leaves — {emp.name}</h3>
            <form onSubmit={handleAllocate}>
              <div className="form-group">
                <label>Leave Type</label>
                <select value={allocForm.leaveType} onChange={(e) => setAllocForm({ ...allocForm, leaveType: e.target.value })}>
                  {leaveTypes.map((lt) => <option key={lt.id} value={lt.id}>{lt.type} (Policy: {lt.total_days} days/year)</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>Action</label>
                  <select value={allocForm.action} onChange={(e) => setAllocForm({ ...allocForm, action: e.target.value })}>
                    <option value="add">Add Leaves</option>
                    <option value="deduct">Deduct Leaves</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Number of Days</label>
                  <input type="number" min="0.5" step="0.5" value={allocForm.days} onChange={(e) => setAllocForm({ ...allocForm, days: e.target.value })} placeholder="e.g. 5" required />
                </div>
              </div>
              <div className="form-group">
                <label>Reason (optional)</label>
                <input type="text" value={allocForm.reason} onChange={(e) => setAllocForm({ ...allocForm, reason: e.target.value })} placeholder="e.g. Annual allocation, bonus leave" />
              </div>
              {allocForm.leaveType && allocForm.days && (
                <div style={{ padding: 12, background: allocForm.action === "add" ? "var(--success-bg)" : "var(--danger-bg)", borderRadius: 8, fontSize: "0.82rem", color: allocForm.action === "add" ? "var(--success)" : "var(--danger)", marginBottom: 16 }}>
                  <i className={`fas ${allocForm.action === "add" ? "fa-plus-circle" : "fa-minus-circle"}`} style={{ marginRight: 6 }} />
                  {allocForm.action === "add" ? "Adding" : "Deducting"} <strong>{allocForm.days} days</strong> of <strong>{leaveTypes.find((t) => String(t.id) === allocForm.leaveType)?.type}</strong> to {emp.name}'s balance
                </div>
              )}
              <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAllocate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <i className={`fas ${allocForm.action === "add" ? "fa-plus" : "fa-minus"}`} /> {allocForm.action === "add" ? "Add Leaves" : "Deduct Leaves"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function PerformanceTab({ emp, attendance, isAdmin }) {
  const [reviews, setReviews] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ period: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`, rating: 3, strengths: "", improvements: "", goals: "", comments: "" });

  useEffect(() => {
    supabase.from("performance_reviews").select("*").eq("employee_id", emp.id).order("created_at", { ascending: false }).then(({ data }) => { if (data) setReviews(data); });
  }, [emp.id]);

  async function handleSubmitReview(e) {
    e.preventDefault();
    await supabase.from("performance_reviews").insert({ employee_id: emp.id, ...reviewForm, status: "submitted" });
    const { data } = await supabase.from("performance_reviews").select("*").eq("employee_id", emp.id).order("created_at", { ascending: false });
    if (data) setReviews(data);
    setShowReview(false);
  }

  const now = new Date();
  const last30 = attendance.filter((a) => { if (a.employeeId !== emp.id) return false; const diff = (now - new Date(a.date)) / 86400000; return diff >= 0 && diff <= 30; });
  const present = last30.filter((a) => a.status === "present").length;
  const totalH = last30.reduce((s, a) => s + (a.hours || 0), 0);
  const avgH = present > 0 ? (totalH / present).toFixed(1) : "0";
  const late = last30.filter((a) => { if (!a.clockIn) return false; const [h] = a.clockIn.split(":").map(Number); return h >= 10; }).length;
  const overtime = last30.filter((a) => a.hours && a.hours > 9).length;
  const attRate = Math.round((present / 22) * 100);
  const punctRate = present > 0 ? Math.round(((present - late) / present) * 100) : 0;

  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[{ l: "Attendance", v: `${attRate}%`, c: attRate >= 90 ? "var(--success)" : "var(--warning)" }, { l: "Punctuality", v: `${punctRate}%`, c: punctRate >= 90 ? "var(--success)" : "var(--warning)" }, { l: "Avg Hours", v: `${avgH}h`, c: Number(avgH) >= 8 ? "var(--success)" : "var(--warning)" }, { l: "Late Arrivals", v: late, c: late <= 2 ? "var(--success)" : "var(--danger)" }, { l: "Overtime Days", v: overtime, c: "var(--info)" }].map((m) => (
          <div key={m.l} className="stat-card" style={{ textAlign: "center" }}><div style={{ fontSize: "1.5rem", fontWeight: 700, color: m.c }}>{m.v}</div><div style={{ fontSize: "0.72rem", color: "var(--gray-500)" }}>{m.l}</div></div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}><div className="card-header"><h2>Progress</h2></div><div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {[{ l: "Attendance", v: attRate, c: "var(--success)" }, { l: "Punctuality", v: punctRate, c: "var(--primary)" }, { l: "Hours Compliance", v: Math.min(100, Math.round((Number(avgH) / 8) * 100)), c: "var(--info)" }].map((b) => (
          <div key={b.l}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.85rem" }}><span style={{ fontWeight: 500 }}>{b.l}</span><span style={{ fontWeight: 600, color: b.c }}>{b.v}%</span></div><div style={{ background: "var(--gray-100)", borderRadius: 8, height: 10, overflow: "hidden" }}><div style={{ width: `${b.v}%`, height: "100%", background: b.c, borderRadius: 8 }} /></div></div>
        ))}
      </div></div>

      {/* Performance Reviews */}
      <div className="card">
        <div className="card-header">
          <h2>Performance Reviews</h2>
          {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => setShowReview(true)}><i className="fas fa-plus" /> Add Review</button>}
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>Period</th><th>Rating</th><th>Strengths</th><th>Improvements</th><th>Status</th></tr></thead>
            <tbody>
              {reviews.length === 0 ? <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>No reviews yet</td></tr> :
              reviews.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.period}</strong></td>
                  <td style={{ color: "var(--warning)", letterSpacing: 2 }}>{stars(r.rating)}</td>
                  <td className="text-sm">{r.strengths || "—"}</td>
                  <td className="text-sm">{r.improvements || "—"}</td>
                  <td><Badge status={r.status === "submitted" ? "approved" : "pending"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showReview && (
        <div className="modal-overlay" onClick={() => setShowReview(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h3><i className="fas fa-chart-line" style={{ marginRight: 8, color: "var(--primary)" }} />Performance Review — {emp.name}</h3>
            <form onSubmit={handleSubmitReview}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group"><label>Period</label><input type="text" value={reviewForm.period} onChange={(e) => setReviewForm({ ...reviewForm, period: e.target.value })} required /></div>
                <div className="form-group"><label>Rating (1-5)</label><select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{stars(n)} ({n})</option>)}</select></div>
              </div>
              <div className="form-group"><label>Strengths</label><textarea rows="2" value={reviewForm.strengths} onChange={(e) => setReviewForm({ ...reviewForm, strengths: e.target.value })} placeholder="Key strengths observed" /></div>
              <div className="form-group"><label>Areas for Improvement</label><textarea rows="2" value={reviewForm.improvements} onChange={(e) => setReviewForm({ ...reviewForm, improvements: e.target.value })} placeholder="Areas to improve" /></div>
              <div className="form-group"><label>Goals for Next Period</label><textarea rows="2" value={reviewForm.goals} onChange={(e) => setReviewForm({ ...reviewForm, goals: e.target.value })} placeholder="Goals and targets" /></div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowReview(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function ExpenseTab({ emp }) {
  const [expenses, setExpenses] = useState([]);
  useEffect(() => { supabase.from("expenses").select("*").eq("employee_id", emp.id).order("created_at", { ascending: false }).then(({ data }) => { if (data) setExpenses(data); }); }, [emp.id]);
  return (
    <div className="card"><div className="card-header"><h2>Expense & Travel Claims</h2></div>
      <div className="table-container"><table><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>{expenses.length === 0 ? <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}><i className="fas fa-receipt" style={{ fontSize: "2rem", marginBottom: 8, display: "block", opacity: 0.3 }} />No claims yet</td></tr> :
        expenses.map((e) => (<tr key={e.id}><td>{formatDate(e.date)}</td><td>{e.category}</td><td className="text-sm">{e.description}</td><td className="salary-cell">{formatCurrency(Number(e.amount))}</td><td><Badge status={e.status} /></td></tr>))
        }</tbody></table></div>
    </div>
  );
}

const defaultOnboardingTasks = [
  "Submit ID proof (Aadhaar/Passport)",
  "Submit PAN card copy",
  "Submit bank account details",
  "Sign offer letter",
  "Complete IT setup (laptop, email, access)",
  "Attend HR orientation session",
  "Review company policies & handbook",
  "Meet team manager and members",
  "Set up attendance & leave portal access",
];

function OnboardingTab({ emp, isAdmin }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    supabase.from("onboarding_tasks").select("*").eq("employee_id", emp.id).order("created_at").then(({ data }) => {
      if (data && data.length > 0) setTasks(data);
    });
  }, [emp.id]);

  async function initTasks() {
    const entries = defaultOnboardingTasks.map((task) => ({ employee_id: emp.id, task, completed: false }));
    await supabase.from("onboarding_tasks").insert(entries);
    const { data } = await supabase.from("onboarding_tasks").select("*").eq("employee_id", emp.id).order("created_at");
    if (data) setTasks(data);
  }

  async function toggleTask(id, completed) {
    await supabase.from("onboarding_tasks").update({ completed: !completed, completed_at: !completed ? new Date().toISOString() : null }).eq("id", id);
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed: !completed } : t));
  }

  async function addTask(e) {
    e.preventDefault();
    if (!newTask.trim()) return;
    const { data } = await supabase.from("onboarding_tasks").insert({ employee_id: emp.id, task: newTask }).select().single();
    if (data) setTasks((prev) => [...prev, data]);
    setNewTask("");
  }

  async function deleteTask(id) {
    await supabase.from("onboarding_tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const completed = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <>
      {tasks.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <i className="fas fa-clipboard-list" style={{ fontSize: "3rem", color: "var(--gray-300)", marginBottom: 12 }} />
          <h3 style={{ marginBottom: 8 }}>No Onboarding Checklist</h3>
          <p style={{ color: "var(--gray-500)", fontSize: "0.88rem", marginBottom: 20 }}>Create a standard onboarding checklist for {emp.name}</p>
          {isAdmin && <button className="btn btn-primary" onClick={initTasks}><i className="fas fa-magic" /> Create Default Checklist</button>}
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 20, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Onboarding Progress</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: progress === 100 ? "var(--success)" : "var(--primary)" }}>{completed}/{tasks.length} ({progress}%)</span>
            </div>
            <div style={{ background: "var(--gray-100)", borderRadius: 8, height: 12, overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: progress === 100 ? "var(--success)" : "var(--primary)", borderRadius: 8, transition: "width 0.3s" }} />
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2>Checklist</h2></div>
            <div style={{ padding: "0 20px 20px" }}>
              {tasks.map((t) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--gray-50)" }}>
                  <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t.id, t.completed)} style={{ width: 20, height: 20, accentColor: "var(--success)", cursor: "pointer" }} />
                  <span style={{ flex: 1, fontSize: "0.88rem", textDecoration: t.completed ? "line-through" : "none", color: t.completed ? "var(--gray-400)" : "var(--gray-800)" }}>{t.task}</span>
                  {isAdmin && <button style={{ background: "none", border: "none", color: "var(--gray-400)", cursor: "pointer", fontSize: "0.8rem" }} onClick={() => deleteTask(t.id)}><i className="fas fa-times" /></button>}
                </div>
              ))}
              {isAdmin && (
                <form onSubmit={addTask} style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add custom task..." style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--gray-200)", borderRadius: 6, fontSize: "0.85rem" }} />
                  <button type="submit" className="btn btn-outline btn-sm">Add</button>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function DocumentsTab({ emp, isAdmin }) {
  const [docs, setDocs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", category: "ID Proof", file_url: "" });
  const docCats = ["ID Proof", "Address Proof", "PAN Card", "Aadhaar Card", "Offer Letter", "Experience Letter", "Education Certificate", "Bank Details", "Other"];

  useEffect(() => {
    supabase.from("documents").select("*").eq("employee_id", emp.id).order("uploaded_at", { ascending: false }).then(({ data }) => { if (data) setDocs(data); });
  }, [emp.id]);

  async function handleUpload(e) {
    e.preventDefault();
    await supabase.from("documents").insert({ employee_id: emp.id, name: form.name, category: form.category, file_url: form.file_url || null, file_name: form.name });
    const { data } = await supabase.from("documents").select("*").eq("employee_id", emp.id).order("uploaded_at", { ascending: false });
    if (data) setDocs(data);
    setShowAdd(false); setForm({ name: "", category: "ID Proof", file_url: "" });
  }

  async function toggleVerify(id, current) { await supabase.from("documents").update({ verified: !current }).eq("id", id); setDocs((prev) => prev.map((d) => d.id === id ? { ...d, verified: !current } : d)); }
  async function deleteDoc(id) { await supabase.from("documents").delete().eq("id", id); setDocs((prev) => prev.filter((d) => d.id !== id)); }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>Documents ({docs.length})</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><i className="fas fa-upload" /> Upload</button>
        </div>
        <div style={{ padding: "0 20px 20px" }}>
          {docs.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}><i className="fas fa-folder-open" style={{ fontSize: "2rem", marginBottom: 8, display: "block", opacity: 0.3 }} />No documents uploaded</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {docs.map((doc) => (
                <div key={doc.id} style={{ padding: 14, border: "1px solid var(--gray-100)", borderRadius: 10, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: doc.verified ? "var(--success-bg)" : "var(--gray-50)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fas fa-file-alt" style={{ color: doc.verified ? "var(--success)" : "var(--gray-400)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{doc.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>{doc.category} {doc.verified ? "· Verified ✓" : "· Pending"}</div>
                  </div>
                  <div className="flex gap-1">
                    {isAdmin && <button style={{ background: "none", border: "none", cursor: "pointer", color: doc.verified ? "var(--success)" : "var(--gray-400)" }} onClick={() => toggleVerify(doc.id, doc.verified)} title={doc.verified ? "Unverify" : "Verify"}><i className={`fas ${doc.verified ? "fa-check-circle" : "fa-circle"}`} /></button>}
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }} onClick={() => deleteDoc(doc.id)}><i className="fas fa-trash" style={{ fontSize: "0.8rem" }} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3><i className="fas fa-upload" style={{ marginRight: 8, color: "var(--primary)" }} />Upload Document</h3>
            <form onSubmit={handleUpload}>
              <div className="form-group"><label>Document Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aadhaar Card" required /></div>
              <div className="form-group"><label>Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{docCats.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div className="form-group"><label>Document URL</label><input type="url" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="Google Drive / link" /></div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
