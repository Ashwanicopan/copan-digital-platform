import { useState } from "react";
import Header from "../../components/layout/Header";
import { useData } from "../../context/DataContext";
import { formatCurrency, formatDate } from "../../utils/helpers";

const reportTypes = [
  { id: "attendance", label: "Attendance Report", icon: "fa-clock", color: "var(--success)" },
  { id: "leave", label: "Leave Report", icon: "fa-calendar-alt", color: "var(--primary)" },
  { id: "payroll", label: "Payroll Summary", icon: "fa-wallet", color: "var(--warning)" },
  { id: "headcount", label: "Headcount Report", icon: "fa-users", color: "var(--info)" },
];

export default function ReportsPage() {
  const { employees, attendance, leaveRequests, payroll } = useData();
  const [activeReport, setActiveReport] = useState("attendance");
  const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);

  function exportCSV(headers, rows, filename) {
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  }

  // Attendance Report
  const attInRange = attendance.filter((a) => a.date >= dateFrom && a.date <= dateTo);
  const attByEmp = employees.map((emp) => {
    const records = attInRange.filter((a) => a.employeeId === emp.id);
    const present = records.filter((a) => a.status === "present").length;
    const absent = records.filter((a) => a.status === "absent").length;
    const wfh = records.filter((a) => a.workMode === "wfh").length;
    const totalHours = records.reduce((s, a) => s + (a.hours || 0), 0);
    return { ...emp, present, absent, wfh, totalHours, avgHours: present > 0 ? (totalHours / present).toFixed(1) : "0" };
  });

  // Leave Report
  const leaveInRange = leaveRequests.filter((l) => l.from >= dateFrom || l.to <= dateTo);
  const leaveSummary = { total: leaveInRange.length, approved: leaveInRange.filter((l) => l.status === "approved").length, pending: leaveInRange.filter((l) => l.status === "pending").length, rejected: leaveInRange.filter((l) => l.status === "rejected").length };

  // Payroll
  const totalGross = payroll.reduce((s, p) => s + p.grossEarnings, 0);
  const totalNet = payroll.reduce((s, p) => s + p.netPay, 0);
  const totalDeductions = payroll.reduce((s, p) => s + p.totalDeductions, 0);

  // Headcount
  const byDept = {};
  employees.forEach((e) => { byDept[e.department || "Unassigned"] = (byDept[e.department || "Unassigned"] || 0) + 1; });

  return (
    <>
      <Header title="Reports & Analytics" />
      <div className="page-content">
        {/* Report Type Selector */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {reportTypes.map((r) => (
            <div key={r.id} onClick={() => setActiveReport(r.id)} className="card" style={{ padding: 16, textAlign: "center", cursor: "pointer", border: activeReport === r.id ? `2px solid ${r.color}` : "1px solid var(--gray-200)" }}>
              <i className={`fas ${r.icon}`} style={{ fontSize: "1.3rem", color: r.color, marginBottom: 6 }} />
              <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{r.label}</div>
            </div>
          ))}
        </div>

        {/* Date Range */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <h2>{reportTypes.find((r) => r.id === activeReport)?.label}</h2>
            <div className="flex gap-2">
              <input type="date" className="filter-select" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <input type="date" className="filter-select" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              <button className="btn btn-outline btn-sm" onClick={() => {
                if (activeReport === "attendance") exportCSV(["Name","Department","Present","Absent","WFH","Total Hours","Avg Hours"], attByEmp.map((e) => [e.name,e.department,e.present,e.absent,e.wfh,e.totalHours.toFixed(1),e.avgHours]), "attendance-report.csv");
                if (activeReport === "leave") exportCSV(["Employee","Type","Mode","From","To","Days","Status"], leaveInRange.map((l) => [l.employeeName,l.type,l.leaveMode||"full-day",l.from,l.to,l.days,l.status]), "leave-report.csv");
                if (activeReport === "payroll") exportCSV(["Employee","CTC","Gross","Deductions","Net Pay"], payroll.map((p) => { const emp = employees.find((e) => e.id === p.employeeId); return [emp?.name||"",p.ctc,p.grossEarnings,p.totalDeductions,p.netPay]; }), "payroll-report.csv");
                if (activeReport === "headcount") exportCSV(["Department","Count"], Object.entries(byDept), "headcount-report.csv");
              }}><i className="fas fa-download" /> Export CSV</button>
            </div>
          </div>

          {/* Attendance Report */}
          {activeReport === "attendance" && (
            <div className="table-container">
              <table>
                <thead><tr><th>Employee</th><th>Department</th><th>Present</th><th>Absent</th><th>WFH</th><th>Total Hours</th><th>Avg Hours/Day</th></tr></thead>
                <tbody>
                  {attByEmp.map((e) => (
                    <tr key={e.id}>
                      <td><strong>{e.name}</strong></td><td>{e.department}</td>
                      <td style={{ color: "var(--success)", fontWeight: 600 }}>{e.present}</td>
                      <td style={{ color: "var(--danger)", fontWeight: 600 }}>{e.absent}</td>
                      <td style={{ color: "var(--info)", fontWeight: 600 }}>{e.wfh}</td>
                      <td>{e.totalHours.toFixed(1)}h</td><td>{e.avgHours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Leave Report */}
          {activeReport === "leave" && (
            <>
              <div style={{ display: "flex", gap: 12, padding: "0 20px 16px" }}>
                {[["Total", leaveSummary.total, "var(--gray-900)"], ["Approved", leaveSummary.approved, "var(--success)"], ["Pending", leaveSummary.pending, "var(--warning)"], ["Rejected", leaveSummary.rejected, "var(--danger)"]].map(([l,v,c]) => (
                  <div key={l} style={{ flex: 1, textAlign: "center", padding: 12, background: "var(--gray-50)", borderRadius: 8 }}><div style={{ fontSize: "1.5rem", fontWeight: 700, color: c }}>{v}</div><div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{l}</div></div>
                ))}
              </div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Employee</th><th>Type</th><th>Mode</th><th>From</th><th>To</th><th>Days</th><th>Status</th></tr></thead>
                  <tbody>{leaveInRange.map((l) => (<tr key={l.id}><td><strong>{l.employeeName}</strong></td><td>{l.type}</td><td>{l.leaveMode || "full-day"}</td><td>{formatDate(l.from)}</td><td>{formatDate(l.to)}</td><td>{l.days}</td><td>{l.status}</td></tr>))}</tbody>
                </table>
              </div>
            </>
          )}

          {/* Payroll Report */}
          {activeReport === "payroll" && (
            <>
              <div style={{ display: "flex", gap: 12, padding: "0 20px 16px" }}>
                {[["Total Gross", formatCurrency(totalGross), "var(--primary)"], ["Total Deductions", formatCurrency(totalDeductions), "var(--danger)"], ["Total Net", formatCurrency(totalNet), "var(--success)"], ["Employees", payroll.length, "var(--gray-900)"]].map(([l,v,c]) => (
                  <div key={l} style={{ flex: 1, textAlign: "center", padding: 12, background: "var(--gray-50)", borderRadius: 8 }}><div style={{ fontSize: "1.3rem", fontWeight: 700, color: c }}>{v}</div><div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{l}</div></div>
                ))}
              </div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Employee</th><th>CTC</th><th>Gross</th><th>Deductions</th><th>Net Pay</th></tr></thead>
                  <tbody>{payroll.map((p) => { const emp = employees.find((e) => e.id === p.employeeId); return (<tr key={p.employeeId}><td><strong>{emp?.name}</strong></td><td>{formatCurrency(p.ctc)}</td><td>{formatCurrency(p.grossEarnings)}</td><td style={{ color: "var(--danger)" }}>{formatCurrency(p.totalDeductions)}</td><td style={{ fontWeight: 600 }}>{formatCurrency(p.netPay)}</td></tr>); })}</tbody>
                </table>
              </div>
            </>
          )}

          {/* Headcount Report */}
          {activeReport === "headcount" && (
            <>
              <div style={{ display: "flex", gap: 12, padding: "0 20px 16px" }}>
                <div style={{ flex: 1, textAlign: "center", padding: 12, background: "var(--gray-50)", borderRadius: 8 }}><div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--primary)" }}>{employees.length}</div><div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>Total Employees</div></div>
                {Object.entries(byDept).map(([dept, count]) => (
                  <div key={dept} style={{ flex: 1, textAlign: "center", padding: 12, background: "var(--gray-50)", borderRadius: 8 }}><div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--success)" }}>{count}</div><div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{dept}</div></div>
                ))}
              </div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Employee</th><th>Department</th><th>Designation</th><th>Location</th><th>Join Date</th><th>Status</th></tr></thead>
                  <tbody>{employees.map((e) => (<tr key={e.id}><td><strong>{e.name}</strong></td><td>{e.department}</td><td>{e.designation}</td><td>{e.location}</td><td>{e.joinDate ? formatDate(e.joinDate) : "—"}</td><td>{e.status}</td></tr>))}</tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
