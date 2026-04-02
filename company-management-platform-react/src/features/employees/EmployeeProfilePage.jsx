import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { EMPLOYEES_DATA, LEAVE_BALANCE_DATA, PAYROLL_DATA } from "../../data/mockData";
import { formatDate, formatCurrency } from "../../utils/helpers";

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const emp = EMPLOYEES_DATA.find((e) => e.id === Number(id));

  if (!emp) return <><Header title="Employee Profile" /><div className="page-content"><p>Employee not found.</p></div></>;

  const leaveBalance = LEAVE_BALANCE_DATA.find((l) => l.employeeId === emp.id);
  const payroll = PAYROLL_DATA.find((p) => p.employeeId === emp.id);

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
            {leaveBalance && (
              <div className="detail-item">
                <span className="detail-label">Leave Balance</span>
                <span className="detail-value">CL: {leaveBalance.casual} | SL: {leaveBalance.sick} | EL: {leaveBalance.earned}</span>
              </div>
            )}
          </div>
        </div>

        {payroll && (
          <div className="card mt-4">
            <div className="card-header"><h2>Last Payslip - {payroll.month}</h2></div>
            <div className="table-container">
              <table>
                <thead><tr><th>Basic</th><th>HRA</th><th>Allowances</th><th>Deductions</th><th>Tax</th><th>Net Pay</th></tr></thead>
                <tbody>
                  <tr>
                    <td className="salary-cell">{formatCurrency(payroll.basic)}</td>
                    <td className="salary-cell">{formatCurrency(payroll.hra)}</td>
                    <td className="salary-cell">{formatCurrency(payroll.allowances)}</td>
                    <td className="salary-cell" style={{ color: "var(--danger)" }}>{formatCurrency(payroll.deductions)}</td>
                    <td className="salary-cell" style={{ color: "var(--danger)" }}>{formatCurrency(payroll.tax)}</td>
                    <td className="salary-cell font-semibold">{formatCurrency(payroll.netPay)}</td>
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
