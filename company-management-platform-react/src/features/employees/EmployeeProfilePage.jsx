import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { useData } from "../../context/DataContext";
import { formatDate, formatCurrency } from "../../utils/helpers";

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees, leaveBalances, payroll } = useData();
  const emp = employees.find((e) => e.id === Number(id));

  if (!emp) return <><Header title="Employee Profile" /><div className="page-content"><p>Employee not found.</p></div></>;

  const empLeaves = leaveBalances.filter((l) => l.employeeId === emp.id);
  const payrollEntry = payroll.find((p) => p.employeeId === emp.id);

  // Build leave balance display from available data
  const casualBal = empLeaves.find((l) => l.type === "Casual Leave");
  const sickBal = empLeaves.find((l) => l.type === "Sick Leave");
  const earnedBal = empLeaves.find((l) => l.type === "Earned Leave");

  return (
    <>
      <Header title="Employee Profile" />
      <div className="page-content">
        <button className="btn btn-outline mb-4" onClick={() => navigate("/employees")}>
          <i className="fas fa-arrow-left" /> Back to Employees
        </button>

        <div className="profile-header">
          <Avatar name={emp.name} initials={emp.avatar} size="lg" />
          <div className="profile-info">
            <h2>{emp.name}</h2>
            <div className="designation">{emp.designation} &middot; {emp.department}</div>
            <Badge status={emp.status} />
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="card">
            <div className="card-header"><h2>Personal Information</h2></div>
            {[
              ["Employee ID", emp.employeeId],
              ["Email", emp.email],
              ["Phone", emp.phone],
              ["Location", emp.location],
              ["Join Date", formatDate(emp.joinDate)],
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
              ["Department", emp.department],
              ["Designation", emp.designation],
              ["Reporting Manager", emp.manager || "N/A"],
              ["Monthly CTC", formatCurrency(emp.salary)],
            ].map(([label, value]) => (
              <div className="detail-item mb-4" key={label}>
                <span className="detail-label">{label}</span>
                <span className="detail-value">{value}</span>
              </div>
            ))}
            {empLeaves.length > 0 && (
              <div className="detail-item">
                <span className="detail-label">Leave Balance</span>
                <span className="detail-value">CL: {casualBal?.balance || 0} | SL: {sickBal?.balance || 0} | EL: {earnedBal?.balance || 0}</span>
              </div>
            )}
          </div>
        </div>

        {payrollEntry && (
          <div className="card mt-4">
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
