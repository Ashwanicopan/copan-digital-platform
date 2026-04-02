import { useState } from "react";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { PAYROLL_DATA, EMPLOYEES_DATA } from "../../data/mockData";
import { formatCurrency } from "../../utils/helpers";

export default function PayrollPage() {
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const totalGross = PAYROLL_DATA.reduce((s, p) => s + p.grossEarnings, 0);
  const totalDeductions = PAYROLL_DATA.reduce((s, p) => s + p.totalDeductions, 0);
  const totalNet = PAYROLL_DATA.reduce((s, p) => s + p.netPay, 0);
  const totalTDS = PAYROLL_DATA.reduce((s, p) => s + p.tds, 0);
  const totalLOP = PAYROLL_DATA.reduce((s, p) => s + p.lopDeduction, 0);

  function openPayslip(p) {
    const emp = EMPLOYEES_DATA.find((e) => e.id === p.employeeId);
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
              <h3>TDS Collected</h3>
              <div className="stat-value" style={{ fontSize: "1.4rem" }}>{formatCurrency(totalTDS)}</div>
            </div>
            <div className="stat-icon orange"><i className="fas fa-file-invoice" /></div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>LOP Deductions</h3>
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
                  <th>LOP</th>
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

  return (
    <div className="payslip">
      {/* Header */}
      <div className="payslip-header">
        <div>
          <h2>Payslip - {data.month}</h2>
          <p className="text-muted">Copan Digital</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={onClose}><i className="fas fa-times" /></button>
      </div>

      {/* Employee Info */}
      <div className="payslip-employee">
        <Avatar name={emp.name} initials={emp.avatar} size="lg" />
        <div>
          <h3>{emp.name}</h3>
          <p className="text-muted">{emp.designation} &middot; {emp.department}</p>
          <p className="text-xs text-muted">Employee ID: {emp.employeeId}</p>
        </div>
        <div className="payslip-ctc">
          <div className="text-xs text-muted">Monthly CTC</div>
          <div className="font-semibold" style={{ fontSize: "1.1rem" }}>{formatCurrency(data.ctc)}</div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="payslip-section">
        <h4 className="payslip-section-title">
          <i className="fas fa-calendar-check" /> Attendance Summary
        </h4>
        <div className="payslip-attendance-grid">
          <div className="payslip-att-item">
            <span className="payslip-att-value">{data.totalCalendarDays}</span>
            <span className="payslip-att-label">Calendar Days</span>
          </div>
          <div className="payslip-att-item">
            <span className="payslip-att-value">{data.weekends}</span>
            <span className="payslip-att-label">Weekends</span>
          </div>
          <div className="payslip-att-item">
            <span className="payslip-att-value">{data.holidays}</span>
            <span className="payslip-att-label">Holidays</span>
          </div>
          <div className="payslip-att-item highlight">
            <span className="payslip-att-value">{data.totalWorkingDays}</span>
            <span className="payslip-att-label">Working Days</span>
          </div>
          <div className="payslip-att-item success">
            <span className="payslip-att-value">{data.presentDays}</span>
            <span className="payslip-att-label">Present</span>
          </div>
          <div className="payslip-att-item">
            <span className="payslip-att-value">{data.paidLeaveDays}</span>
            <span className="payslip-att-label">Paid Leave</span>
          </div>
          <div className="payslip-att-item warn">
            <span className="payslip-att-value">{data.lateDays}</span>
            <span className="payslip-att-label">Late Marks</span>
          </div>
          <div className="payslip-att-item danger">
            <span className="payslip-att-value">{data.unpaidLeaveDays}</span>
            <span className="payslip-att-label">LOP Days</span>
          </div>
        </div>
        {data.lateDays > 0 && (
          <div className="payslip-note warn">
            <i className="fas fa-info-circle" /> {data.lateDays} late mark{data.lateDays > 1 ? "s" : ""} &rarr; {data.lateDeductionDays} day{data.lateDeductionDays !== 1 ? "s" : ""} LOP (every 3 lates = 0.5 day LOP)
          </div>
        )}
        <div className="payslip-payable">
          <span>Payable Days</span>
          <span className="font-semibold">{data.payableDays} / {data.totalWorkingDays}</span>
        </div>
      </div>

      {/* Earnings & Deductions side by side */}
      <div className="payslip-breakdown">
        {/* Earnings */}
        <div className="payslip-section">
          <h4 className="payslip-section-title success-title">
            <i className="fas fa-plus-circle" /> Earnings
          </h4>
          <div className="payslip-rows">
            <PayslipRow label="Basic Salary" sublabel="50% of CTC" amount={data.basic} />
            <PayslipRow label="HRA" sublabel="40% of Basic" amount={data.hra} />
            <PayslipRow label="Special Allowance" sublabel="CTC - Basic - HRA - PF(ER)" amount={data.specialAllowance} />
            <PayslipRow label="Conveyance Allowance" sublabel="Fixed" amount={data.conveyance} />
            <PayslipRow label="Medical Allowance" sublabel="Fixed" amount={data.medical} />
          </div>
          <div className="payslip-total success">
            <span>Gross Earnings</span>
            <span>{formatCurrency(data.grossEarnings)}</span>
          </div>
        </div>

        {/* Deductions */}
        <div className="payslip-section">
          <h4 className="payslip-section-title danger-title">
            <i className="fas fa-minus-circle" /> Deductions
          </h4>
          <div className="payslip-rows">
            <PayslipRow label="PF (Employee)" sublabel="12% of Basic (max ₹15K)" amount={data.pfEmployee} negative />
            <PayslipRow label="Professional Tax" sublabel="Fixed ₹200/month" amount={data.professionalTax} negative />
            <PayslipRow label="TDS (Income Tax)" sublabel="New Regime, annualized/12" amount={data.tds} negative />
            {data.lopDeduction > 0 && (
              <PayslipRow label="LOP Deduction" sublabel={`${data.unpaidLeaveDays} days × ₹${Math.round(data.grossEarnings / data.totalWorkingDays)}/day`} amount={data.lopDeduction} negative />
            )}
          </div>
          <div className="payslip-total danger">
            <span>Total Deductions</span>
            <span>{formatCurrency(data.totalDeductions)}</span>
          </div>
        </div>
      </div>

      {/* Net Pay */}
      <div className="payslip-net">
        <div className="payslip-net-row">
          <div>
            <div className="payslip-net-label">Net Pay</div>
            <div className="payslip-net-formula">Gross Earnings ({formatCurrency(data.grossEarnings)}) - Deductions ({formatCurrency(data.totalDeductions)})</div>
          </div>
          <div className="payslip-net-amount">{formatCurrency(data.netPay)}</div>
        </div>
      </div>

      {/* Employer Contribution (info) */}
      <div className="payslip-employer">
        <h4 className="payslip-section-title">
          <i className="fas fa-building" /> Employer Contributions (not deducted from salary)
        </h4>
        <div className="payslip-rows">
          <PayslipRow label="PF (Employer)" sublabel="12% of Basic (max ₹15K)" amount={data.pfEmployer} info />
        </div>
      </div>
    </div>
  );
}

function PayslipRow({ label, sublabel, amount, negative, info }) {
  const color = negative ? "var(--danger)" : info ? "var(--info)" : "var(--gray-800)";
  return (
    <div className="payslip-row">
      <div>
        <div className="payslip-row-label">{label}</div>
        {sublabel && <div className="payslip-row-sub">{sublabel}</div>}
      </div>
      <div className="payslip-row-amount" style={{ color }}>
        {negative ? "- " : ""}{formatCurrency(amount)}
      </div>
    </div>
  );
}
