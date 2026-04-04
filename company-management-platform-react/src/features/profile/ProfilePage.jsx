import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Header from "../../components/layout/Header";
import Badge from "../../components/ui/Badge";
import { formatDate, formatCurrency } from "../../utils/helpers";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { employees, leaveBalances, payroll } = useData();

  const emp = employees.find((e) => e.email?.toLowerCase() === user?.email?.toLowerCase()) || {};
  const empLeaves = leaveBalances.filter((l) => l.employeeId === emp.id);
  const payrollEntry = payroll.find((p) => p.employeeId === emp.id);

  return (
    <>
      <Header title="My Profile" />
      <div className="page-content">
        {/* Profile Header */}
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--primary-light)" }}
              />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.8rem", fontWeight: 700 }}>
                {user?.avatar}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: 4 }}>{user?.name}</h2>
              <div style={{ color: "var(--gray-500)", fontSize: "0.9rem", marginBottom: 8 }}>
                {emp.designation || user?.designation || ""} {emp.department ? `· ${emp.department}` : ""}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Badge status={emp.status || "active"} />
                <span style={{ background: "var(--primary-bg)", color: "var(--primary)", padding: "3px 12px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600 }}>
                  {user?.role}
                </span>
              </div>
            </div>
            <button className="btn btn-outline" onClick={logout} style={{ alignSelf: "flex-start" }}>
              <i className="fas fa-sign-out-alt" /> Sign Out
            </button>
          </div>
        </div>

        <div className="profile-details-grid" style={{ marginTop: 20 }}>
          {/* Personal Info */}
          <div className="card">
            <div className="card-header"><h2>Personal Information</h2></div>
            {[
              ["Full Name", user?.name],
              ["Email", user?.email],
              ["Employee ID", emp.employeeId],
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

          {/* Employment Details */}
          <div className="card">
            <div className="card-header"><h2>Employment Details</h2></div>
            {[
              ["Department", emp.department || "—"],
              ["Designation", emp.designation || user?.designation || "—"],
              ["Role", user?.role],
              ["Reporting Manager", emp.manager || "—"],
              ["Monthly CTC", emp.salary ? formatCurrency(emp.salary) : "—"],
            ].map(([label, value]) => (
              <div className="detail-item mb-4" key={label}>
                <span className="detail-label">{label}</span>
                <span className="detail-value">{value}</span>
              </div>
            ))}
            {empLeaves.length > 0 && (
              <div className="detail-item">
                <span className="detail-label">Leave Balance</span>
                <span className="detail-value">
                  {empLeaves.map((l) => `${l.type}: ${l.balance}`).join(" | ") || "—"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bank & Payment Info */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header"><h2>Bank & Payment Details</h2></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              ["Payment Mode", emp.paymentMode || "—"],
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

        {/* Last Payslip */}
        {payrollEntry && (
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header"><h2>Last Payslip - {payrollEntry.month}</h2></div>
            <div className="table-container">
              <table>
                <thead><tr><th>Basic</th><th>House Rent Allowance</th><th>Allowances</th><th>Deductions</th><th>Tax</th><th>Net Pay</th></tr></thead>
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
      </div>
    </>
  );
}
