import { useState } from "react";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { useData } from "../../context/DataContext";
import { formatCurrency, formatDate, numberToWords } from "../../utils/helpers";
import copanLogo from "../../assets/images/copan-logo.svg";

export default function PayrollPage() {
  const { payroll: PAYROLL_DATA, employees: EMPLOYEES_DATA } = useData();
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const totalGross = PAYROLL_DATA.reduce((s, p) => s + p.grossEarnings, 0);
  const totalDeductions = PAYROLL_DATA.reduce((s, p) => s + p.totalDeductions, 0);
  const totalNet = PAYROLL_DATA.reduce((s, p) => s + p.netPay, 0);
  const totalTDS = PAYROLL_DATA.reduce((s, p) => s + p.tds, 0);
  const totalLOP = PAYROLL_DATA.reduce((s, p) => s + p.lopDeduction, 0);

  function openPayslip(p) {
    const emp = p.emp || EMPLOYEES_DATA.find((e) => e.id === p.employeeId);
    setSelectedPayslip({ ...p, emp });
  }

  return (
    <>
      <Header title="Payroll" />
      <div className="page-content">
        {/* Summary Cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
          <div className="stat-card">
            <div className="stat-info">
              <h3>Gross Pay</h3>
              <div className="stat-value" style={{ fontSize: "1.4rem" }}>{formatCurrency(totalGross)}</div>
              <div className="stat-change">{PAYROLL_DATA.length} employees</div>
            </div>
            <div className="stat-icon blue"><i className="fas fa-coins" /></div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>Total Deductions</h3>
              <div className="stat-value" style={{ fontSize: "1.4rem", color: "var(--danger)" }}>{formatCurrency(totalDeductions)}</div>
            </div>
            <div className="stat-icon red"><i className="fas fa-minus-circle" /></div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>Net Payout</h3>
              <div className="stat-value" style={{ fontSize: "1.4rem", color: "var(--success)" }}>{formatCurrency(totalNet)}</div>
            </div>
            <div className="stat-icon green"><i className="fas fa-wallet" /></div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>Tax Deducted at Source</h3>
              <div className="stat-value" style={{ fontSize: "1.4rem" }}>{formatCurrency(totalTDS)}</div>
            </div>
            <div className="stat-icon orange"><i className="fas fa-file-invoice" /></div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>Loss of Pay Deductions</h3>
              <div className="stat-value" style={{ fontSize: "1.4rem", color: "var(--danger)" }}>{formatCurrency(totalLOP)}</div>
            </div>
            <div className="stat-icon red"><i className="fas fa-clock" /></div>
          </div>
        </div>

        {/* Employee Payroll Table */}
        <div className="card">
          <div className="card-header">
            <h2>Payroll Details - March 2026</h2>
            <div className="flex gap-2">
              <select className="filter-select">
                <option>March 2026</option><option>February 2026</option><option>January 2026</option>
              </select>
              <button className="btn btn-outline btn-sm"><i className="fas fa-download" /> Export</button>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Working Days</th>
                  <th>Present</th>
                  <th>Late</th>
                  <th>Loss of Pay</th>
                  <th>Gross</th>
                  <th>Deductions</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {PAYROLL_DATA.map((p) => {
                  const emp = EMPLOYEES_DATA.find((e) => e.id === p.employeeId);
                  if (!emp) return null;
                  return (
                    <tr key={p.employeeId} className="clickable-row" onClick={() => openPayslip(p)}>
                      <td>
                        <div className="employee-cell">
                          <Avatar name={emp.name} initials={emp.avatar} />
                          <div><div className="name">{emp.name}</div><div className="sub">{emp.employeeId}</div></div>
                        </div>
                      </td>
                      <td>{p.totalWorkingDays}</td>
                      <td>{p.presentDays}</td>
                      <td>
                        {p.lateDays > 0 ? (
                          <span className="badge badge-warning">{p.lateDays} late</span>
                        ) : <span className="text-muted">0</span>}
                      </td>
                      <td>
                        {p.unpaidLeaveDays > 0 ? (
                          <span className="badge badge-danger">{p.unpaidLeaveDays} days</span>
                        ) : <span className="text-muted">0</span>}
                      </td>
                      <td className="salary-cell">{formatCurrency(p.grossEarnings)}</td>
                      <td className="salary-cell" style={{ color: "var(--danger)" }}>{formatCurrency(p.totalDeductions)}</td>
                      <td className="salary-cell font-semibold">{formatCurrency(p.netPay)}</td>
                      <td><Badge status={p.status} /></td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); openPayslip(p); }}>
                          <i className="fas fa-eye" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payslip Detail Modal */}
      {selectedPayslip && (
        <div className="modal-overlay" onClick={() => setSelectedPayslip(null)}>
          <div className="payslip-modal" onClick={(e) => e.stopPropagation()}>
            <PayslipDetail data={selectedPayslip} onClose={() => setSelectedPayslip(null)} />
          </div>
        </div>
      )}
    </>
  );
}

function PayslipDetail({ data, onClose }) {
  const { emp } = data;
  const pfAccountNo = `PYBNG00631020000${emp.id.toString().padStart(3, "0")}28 JXOPE1760A`;

  return (
    <div className="payslip-doc">
      {/* Close Button */}
      <button className="payslip-doc-close" onClick={onClose}><i className="fas fa-times" /></button>

      {/* Document Header */}
      <div className="payslip-doc-header">
        <div>
          <h1 className="payslip-doc-title">PAYSLIP <span>{data.month.toUpperCase()}</span></h1>
          <p className="payslip-doc-company">COPAN CONSULTANCY SERVICES PRIVATE LIMITED</p>
          <p className="payslip-doc-address">FLAT NUMBER 5, 3RD FLOOR, HIBISCUS PARK</p>
          <p className="payslip-doc-address">SECTOR 25</p>
          <p className="payslip-doc-address">Panchkula, Haryana 134116</p>
        </div>
        <div className="payslip-doc-logo">
          <img src={copanLogo} alt="Copan" />
        </div>
      </div>

      <div className="payslip-doc-divider" />

      {/* Employee Info */}
      <h3 className="payslip-doc-emp-name">{emp.name.toUpperCase()}</h3>
      <table className="payslip-doc-info-table">
        <tbody>
          <tr>
            <td className="payslip-doc-info-label">Employee ID</td>
            <td className="payslip-doc-info-value">{emp.employeeId}</td>
            <td className="payslip-doc-info-label">Date of Joining</td>
            <td className="payslip-doc-info-value">{formatDate(emp.joinDate)}</td>
            <td className="payslip-doc-info-label">Department</td>
            <td className="payslip-doc-info-value">{emp.department}</td>
          </tr>
          <tr>
            <td className="payslip-doc-info-label">Designation</td>
            <td className="payslip-doc-info-value">{emp.designation}</td>
            <td className="payslip-doc-info-label">Bank Account Number</td>
            <td className="payslip-doc-info-value">{emp.bankAccount}</td>
            <td className="payslip-doc-info-label">Location</td>
            <td className="payslip-doc-info-value">{emp.location}</td>
          </tr>
          <tr>
            <td className="payslip-doc-info-label">Payment Mode</td>
            <td className="payslip-doc-info-value">{emp.paymentMode}</td>
            <td className="payslip-doc-info-label">Bank Name</td>
            <td className="payslip-doc-info-value">{emp.bankName}</td>
            <td className="payslip-doc-info-label">Permanent Account Number</td>
            <td className="payslip-doc-info-value">{emp.pan}</td>
          </tr>
          <tr>
            <td className="payslip-doc-info-label">Universal Account Number</td>
            <td className="payslip-doc-info-value">{emp.uan}</td>
            <td className="payslip-doc-info-label">Provident Fund Account Number</td>
            <td className="payslip-doc-info-value" colSpan="3">{pfAccountNo}</td>
          </tr>
        </tbody>
      </table>

      <div className="payslip-doc-divider" />

      {/* Salary Details */}
      <h4 className="payslip-doc-section-title">SALARY DETAILS</h4>
      <table className="payslip-doc-salary-summary">
        <thead>
          <tr>
            <th>Number of Payable Days</th>
            <th>Gross Working Days</th>
            <th>Loss of Pay Days</th>
            <th>Days Payable</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data.totalWorkingDays}.0</td>
            <td>{data.totalWorkingDays}.0</td>
            <td>{data.unpaidLeaveDays > 0 ? data.unpaidLeaveDays.toFixed(2) : "0.00"}</td>
            <td>{data.payableDays}</td>
          </tr>
        </tbody>
      </table>

      <div className="payslip-doc-divider" />

      {/* Earnings & Contributions side by side */}
      <div className="payslip-doc-breakdown">
        <div className="payslip-doc-earnings">
          <h4 className="payslip-doc-col-title">EARNINGS</h4>
          <table className="payslip-doc-table">
            <tbody>
              <tr><td>Basic</td><td className="payslip-doc-amount">{formatCurrency(data.basic)}</td></tr>
              <tr><td>House Rent Allowance</td><td className="payslip-doc-amount">{formatCurrency(data.hra)}</td></tr>
              <tr><td>Medical Allowance</td><td className="payslip-doc-amount">{formatCurrency(data.medical)}</td></tr>
              <tr><td>Special Allowance</td><td className="payslip-doc-amount">{formatCurrency(data.specialAllowance)}</td></tr>
              <tr><td>Transport Allowance</td><td className="payslip-doc-amount">{formatCurrency(data.conveyance)}</td></tr>
              <tr className="payslip-doc-total-row">
                <td><strong>Total Earnings (A)</strong></td>
                <td className="payslip-doc-amount"><strong>{formatCurrency(data.grossEarnings)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="payslip-doc-contributions">
          <h4 className="payslip-doc-col-title">CONTRIBUTIONS</h4>
          <table className="payslip-doc-table">
            <tbody>
              <tr><td>Provident Fund - Employee</td><td className="payslip-doc-amount">{formatCurrency(data.pfEmployee)}</td></tr>
              <tr><td>Provident Fund - Employer</td><td className="payslip-doc-amount">{formatCurrency(data.pfEmployer)}</td></tr>
              <tr className="payslip-doc-total-row">
                <td><strong>Total Contributions (B)</strong></td>
                <td className="payslip-doc-amount"><strong>{formatCurrency(data.pfEmployee + data.pfEmployer)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="payslip-doc-divider" />

      {/* Net Salary */}
      <table className="payslip-doc-net-table">
        <tbody>
          <tr>
            <td className="payslip-doc-net-label">Net Salary Payable ( A - B )</td>
            <td className="payslip-doc-net-value">{formatCurrency(data.netPay)}</td>
          </tr>
          <tr>
            <td className="payslip-doc-net-label">Net Salary in words</td>
            <td className="payslip-doc-net-words">{numberToWords(data.netPay)}</td>
          </tr>
        </tbody>
      </table>

      <div className="payslip-doc-divider" />

      {/* Note */}
      <p className="payslip-doc-note">
        <strong>*Note -</strong> All amounts displayed in this payslip are in <strong>Indian Rupees (INR)</strong>
      </p>
      <p className="payslip-doc-disclaimer">
        * This is a computer generated statement does not require signature.
      </p>
    </div>
  );
}
