import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { useData } from "../../context/DataContext";
import { formatDate, formatCurrency } from "../../utils/helpers";

const tabs = [
  { id: "overview", label: "Overview", icon: "fa-user" },
  { id: "attendance", label: "Attendance", icon: "fa-clock" },
  { id: "leave", label: "Leave", icon: "fa-calendar-alt" },
  { id: "performance", label: "Performance", icon: "fa-chart-line" },
  { id: "expense", label: "Expense & Travel", icon: "fa-receipt" },
];

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees, leaveBalances, leaveRequests, payroll, attendance } = useData();
  const emp = employees.find((e) => e.id === Number(id));
  const [activeTab, setActiveTab] = useState("overview");

  if (!emp) return <><Header title="Employee Profile" /><div className="page-content"><p>Employee not found.</p></div></>;

  const payrollEntry = payroll.find((p) => p.employeeId === emp.id);

  return (
    <>
      <Header title="Employee Profile" />
      <div className="page-content">
        <button className="btn btn-outline mb-4" onClick={() => navigate("/employees")}>
          <i className="fas fa-arrow-left" /> Back to Employees
        </button>

        <div className="profile-header">
          <Avatar name={emp.name} initials={emp.avatar} avatarUrl={emp.avatarUrl} size="lg" />
          <div className="profile-info">
            <h2>{emp.name}</h2>
            <div className="designation">{emp.designation} {emp.department ? `· ${emp.department}` : ""}</div>
            <Badge status={emp.status} />
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginTop: 20, marginBottom: 20 }}>
          {tabs.map((t) => (
            <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
              <i className={`fas ${t.icon}`} style={{ marginRight: 6 }} />{t.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && <OverviewTab emp={emp} payrollEntry={payrollEntry} />}
        {activeTab === "attendance" && <AttendanceTab emp={emp} attendance={attendance} />}
        {activeTab === "leave" && <LeaveTab emp={emp} leaveRequests={leaveRequests} leaveBalances={leaveBalances} />}
        {activeTab === "performance" && <PerformanceTab emp={emp} attendance={attendance} />}
        {activeTab === "expense" && <ExpenseTab emp={emp} />}
      </div>
    </>
  );
}

function OverviewTab({ emp, payrollEntry }) {
  return (
    <>
      <div className="profile-details-grid">
        <div className="card">
          <div className="card-header"><h2>Personal Information</h2></div>
          {[
            ["Employee ID", emp.employeeId],
            ["Email", emp.email],
            ["Phone", emp.phone || "—"],
            ["Location", emp.location || "—"],
            ["Join Date", emp.joinDate ? formatDate(emp.joinDate) : "—"],
          ].map(([label, value]) => (
            <div className="detail-item mb-4" key={label}>
              <span className="detail-label">{label}</span>
              <span className="detail-value">{value}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header"><h2>Employment Details</h2></div>
          {[
            ["Department", emp.department || "—"],
            ["Designation", emp.designation || "—"],
            ["Reporting Manager", emp.manager || "—"],
            ["Monthly CTC", emp.salary ? formatCurrency(emp.salary) : "—"],
          ].map(([label, value]) => (
            <div className="detail-item mb-4" key={label}>
              <span className="detail-label">{label}</span>
              <span className="detail-value">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h2>Bank & Payment Details</h2></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            ["Payment Mode", emp.paymentMode || "Bank Transfer"],
            ["Bank Name", emp.bankName || "—"],
            ["Bank Account", emp.bankAccount || "—"],
            ["PAN", emp.pan || "—"],
            ["UAN", emp.uan || "—"],
          ].map(([label, value]) => (
            <div className="detail-item" key={label} style={{ padding: "12px 0" }}>
              <span className="detail-label">{label}</span>
              <span className="detail-value">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {payrollEntry && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header"><h2>Last Payslip - {payrollEntry.month}</h2></div>
          <div className="table-container">
            <table>
              <thead><tr><th>Basic</th><th>HRA</th><th>Allowances</th><th>Deductions</th><th>Tax</th><th>Net Pay</th></tr></thead>
              <tbody>
                <tr>
                  <td className="salary-cell">{formatCurrency(payrollEntry.basic)}</td>
                  <td className="salary-cell">{formatCurrency(payrollEntry.hra)}</td>
                  <td className="salary-cell">{formatCurrency(payrollEntry.specialAllowance + payrollEntry.conveyance + payrollEntry.medical)}</td>
                  <td className="salary-cell" style={{ color: "var(--danger)" }}>{formatCurrency(payrollEntry.pfEmployee + payrollEntry.professionalTax)}</td>
                  <td className="salary-cell" style={{ color: "var(--danger)" }}>{formatCurrency(payrollEntry.tds)}</td>
                  <td className="salary-cell font-semibold">{formatCurrency(payrollEntry.netPay)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function AttendanceTab({ emp, attendance }) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthAttendance = attendance.filter((a) => {
    if (a.employeeId !== emp.id) return false;
    const d = new Date(a.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const presentDays = monthAttendance.filter((a) => a.status === "present").length;
  const absentDays = monthAttendance.filter((a) => a.status === "absent").length;
  const totalHours = monthAttendance.reduce((s, a) => s + (a.hours || 0), 0);
  const avgHours = presentDays > 0 ? (totalHours / presentDays).toFixed(1) : "0";

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Present", value: presentDays, color: "var(--success)" },
          { label: "Absent", value: absentDays, color: "var(--danger)" },
          { label: "Total Hours", value: totalHours.toFixed(1) + "h", color: "var(--primary)" },
          { label: "Avg Hours/Day", value: avgHours + "h", color: "var(--gray-900)" },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h2>Attendance - {months[currentMonth]} {currentYear}</h2></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Date</th><th>Day</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Status</th></tr></thead>
            <tbody>
              {monthAttendance.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>No attendance records this month</td></tr>
              ) : (
                monthAttendance.map((a, i) => (
                  <tr key={i}>
                    <td>{formatDate(a.date)}</td>
                    <td>{new Date(a.date).toLocaleDateString("en-IN", { weekday: "short" })}</td>
                    <td>{a.clockIn || "—"}</td>
                    <td>{a.clockOut || "—"}</td>
                    <td>{a.hours ? a.hours + "h" : "—"}</td>
                    <td><Badge status={a.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function LeaveTab({ emp, leaveRequests, leaveBalances }) {
  const empLeaves = leaveRequests.filter((l) => l.employeeId === emp.id).sort((a, b) => (b.appliedOn || "").localeCompare(a.appliedOn || ""));
  const empBalances = leaveBalances.filter((l) => l.employeeId === emp.id);

  return (
    <>
      {empBalances.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {empBalances.map((b) => (
            <div key={b.type} className="stat-card" style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primary)" }}>{b.balance}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{b.type}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-header"><h2>Leave History</h2></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th></tr></thead>
            <tbody>
              {empLeaves.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>No leave requests</td></tr>
              ) : (
                empLeaves.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.type}</strong></td>
                    <td>{formatDate(l.from)}</td>
                    <td>{formatDate(l.to)}</td>
                    <td>{l.days}</td>
                    <td className="text-sm">{l.reason}</td>
                    <td><Badge status={l.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function PerformanceTab({ emp, attendance }) {
  const now = new Date();
  const last30 = attendance.filter((a) => {
    if (a.employeeId !== emp.id) return false;
    const d = new Date(a.date);
    const diff = (now - d) / 86400000;
    return diff >= 0 && diff <= 30;
  });

  const presentDays = last30.filter((a) => a.status === "present").length;
  const totalHours = last30.reduce((s, a) => s + (a.hours || 0), 0);
  const avgHours = presentDays > 0 ? (totalHours / presentDays).toFixed(1) : "0";
  const lateDays = last30.filter((a) => {
    if (!a.clockIn) return false;
    const [h] = a.clockIn.split(":").map(Number);
    return h >= 10; // After 10 AM considered late (simplified)
  }).length;

  const attendanceRate = presentDays > 0 ? Math.round((presentDays / 22) * 100) : 0;
  const punctualityRate = presentDays > 0 ? Math.round(((presentDays - lateDays) / presentDays) * 100) : 0;

  const metrics = [
    { label: "Attendance Rate", value: `${attendanceRate}%`, icon: "fa-user-check", color: attendanceRate >= 90 ? "var(--success)" : attendanceRate >= 75 ? "var(--warning)" : "var(--danger)" },
    { label: "Punctuality", value: `${punctualityRate}%`, icon: "fa-clock", color: punctualityRate >= 90 ? "var(--success)" : punctualityRate >= 75 ? "var(--warning)" : "var(--danger)" },
    { label: "Avg Hours/Day", value: `${avgHours}h`, icon: "fa-hourglass-half", color: Number(avgHours) >= 8 ? "var(--success)" : Number(avgHours) >= 6 ? "var(--warning)" : "var(--danger)" },
    { label: "Late Arrivals", value: lateDays, icon: "fa-exclamation-triangle", color: lateDays <= 2 ? "var(--success)" : lateDays <= 5 ? "var(--warning)" : "var(--danger)" },
  ];

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {metrics.map((m) => (
          <div key={m.label} className="card" style={{ padding: 20, textAlign: "center" }}>
            <i className={`fas ${m.icon}`} style={{ fontSize: "1.5rem", color: m.color, marginBottom: 8 }} />
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h2>Performance Summary (Last 30 Days)</h2></div>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Attendance", value: attendanceRate, color: "var(--success)" },
              { label: "Punctuality", value: punctualityRate, color: "var(--primary)" },
              { label: "Hours Compliance", value: Math.min(100, Math.round((Number(avgHours) / 8) * 100)), color: "var(--info)" },
            ].map((bar) => (
              <div key={bar.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.85rem" }}>
                  <span style={{ fontWeight: 500 }}>{bar.label}</span>
                  <span style={{ fontWeight: 600, color: bar.color }}>{bar.value}%</span>
                </div>
                <div style={{ background: "var(--gray-100)", borderRadius: 8, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${bar.value}%`, height: "100%", background: bar.color, borderRadius: 8, transition: "width 0.5s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ExpenseTab({ emp }) {
  const [expenses] = useState([]);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Total Claims", value: "₹0", icon: "fa-receipt", color: "var(--primary)" },
          { label: "Approved", value: "₹0", icon: "fa-check-circle", color: "var(--success)" },
          { label: "Pending", value: "₹0", icon: "fa-hourglass-half", color: "var(--warning)" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: 20, textAlign: "center" }}>
            <i className={`fas ${s.icon}`} style={{ fontSize: "1.3rem", color: s.color, marginBottom: 8 }} />
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Expense & Travel Claims</h2>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>
                  <i className="fas fa-receipt" style={{ fontSize: "2rem", marginBottom: 8, display: "block", opacity: 0.3 }} />
                  No expense or travel claims yet
                </td></tr>
              ) : (
                expenses.map((e, i) => (
                  <tr key={i}>
                    <td>{formatDate(e.date)}</td>
                    <td>{e.category}</td>
                    <td>{e.description}</td>
                    <td className="salary-cell">{formatCurrency(e.amount)}</td>
                    <td><Badge status={e.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
