import { useState } from "react";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { useData } from "../../context/DataContext";
import { formatCurrency, formatDate, numberToWords } from "../../utils/helpers";
import copanLogo from "../../assets/images/copan-logo.png";
import { supabase } from "../../lib/supabase";

function buildPayrollEntry(emp, month, year) {
  const ctc = Number(emp.salary) || 0;
  const basic = Math.round(ctc * 0.50);
  const hra = Math.round(basic * 0.40);
  const pfEmployer = Math.round(Math.min(basic, 15000) * 0.12);
  const specialAllowance = Math.max(0, ctc - basic - hra - pfEmployer);
  const conveyance = 1600, medical = 1250;
  const grossEarnings = basic + hra + specialAllowance + conveyance + medical;
  const pfEmployee = Math.round(Math.min(basic, 15000) * 0.12);
  const totalWorkingDays = 22;
  const annualTaxable = (grossEarnings - pfEmployee) * 12 - 75000;
  let tax = 0, rem = Math.max(0, annualTaxable);
  for (const [limit, rate] of [[400000,0],[400000,0.05],[400000,0.10],[400000,0.15],[400000,0.20],[Infinity,0.30]]) {
    if (rem <= 0) break; tax += Math.min(rem, limit) * rate; rem -= limit;
  }
  const tds = Math.round((tax + tax * 0.04) / 12);
  const totalDeductions = pfEmployee + 200 + tds;
  return {
    employeeId: emp.id, month: `${month} ${year}`, year,
    totalCalendarDays: 30, weekends: 8, holidays: 1, totalWorkingDays,
    presentDays: totalWorkingDays, paidLeaveDays: 0, unpaidLeaveDays: 0,
    lateDays: 0, lateDeductionDays: 0, halfDays: 0, payableDays: totalWorkingDays,
    ctc, basic, hra, specialAllowance, conveyance, medical,
    grossEarnings, pfEmployee, pfEmployer, professionalTax: 200, tds,
    lopDeduction: 0, totalDeductions,
    netPay: Math.round(grossEarnings - totalDeductions),
    status: "draft",
    emp,
  };
}

export default function PayrollPage() {
  const { payroll: PAYROLL_DATA, employees: EMPLOYEES_DATA } = useData();
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [processing, setProcessing] = useState(false);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const now = new Date();
  const currentMonth = months[now.getMonth()];
  const currentYear = now.getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear] = useState(currentYear);

  // Use existing payroll data or generate from employees
  const payrollForMonth = PAYROLL_DATA.filter((p) => p.month === `${selectedMonth} ${selectedYear}`);
  const displayData = payrollForMonth.length > 0
    ? payrollForMonth
    : EMPLOYEES_DATA.map((emp) => buildPayrollEntry(emp, selectedMonth, selectedYear));

  const totalGross = displayData.reduce((s, p) => s + p.grossEarnings, 0);
  const totalDeductions = displayData.reduce((s, p) => s + p.totalDeductions, 0);
  const totalNet = displayData.reduce((s, p) => s + p.netPay, 0);
  const totalTDS = displayData.reduce((s, p) => s + p.tds, 0);
  const isProcessed = payrollForMonth.length > 0;

  function openPayslip(p) {
    const emp = p.emp || EMPLOYEES_DATA.find((e) => e.id === p.employeeId);
    setSelectedPayslip({ ...p, emp });
  }

  async function processPayroll() {
    setProcessing(true);
    try {
      const entries = EMPLOYEES_DATA.map((emp) => {
        const entry = buildPayrollEntry(emp, selectedMonth, selectedYear);
        return {
          employee_id: emp.id,
          month: `${selectedMonth} ${selectedYear}`,
          year: selectedYear,
          total_calendar_days: entry.totalCalendarDays,
          weekends: entry.weekends,
          holidays: entry.holidays,
          total_working_days: entry.totalWorkingDays,
          present_days: entry.presentDays,
          paid_leave_days: entry.paidLeaveDays,
          unpaid_leave_days: entry.unpaidLeaveDays,
          late_days: entry.lateDays,
          late_deduction_days: entry.lateDeductionDays,
          half_days: entry.halfDays,
          payable_days: entry.payableDays,
          ctc: entry.ctc,
          basic: entry.basic,
          hra: entry.hra,
          special_allowance: entry.specialAllowance,
          conveyance: entry.conveyance,
          medical: entry.medical,
          gross_earnings: entry.grossEarnings,
          pf_employee: entry.pfEmployee,
          pf_employer: entry.pfEmployer,
          professional_tax: entry.professionalTax,
          tds: entry.tds,
          lop_deduction: entry.lopDeduction,
          total_deductions: entry.totalDeductions,
          net_pay: entry.netPay,
          status: "processed",
        };
      });
      await supabase.from("payroll").insert(entries);
      alert("Payroll processed successfully!");
      window.location.reload();
    } catch (e) {
      alert("Error processing payroll: " + e.message);
    }
    setProcessing(false);
  }

  return (
    <>
      <Header title="Payroll" />
      <div className="page-content">
        {/* Summary Cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          <div className="stat-card">
            <div className="stat-info">
              <h3>Gross Pay</h3>
              <div className="stat-value" style={{ fontSize: "1.4rem" }}>{formatCurrency(totalGross)}</div>
              <div className="stat-change">{displayData.length} employees</div>
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
        </div>

        {/* Employee Payroll Table */}
        <div className="card">
          <div className="card-header">
            <h2>Payroll - {selectedMonth} {selectedYear}</h2>
            <div className="flex gap-2">
              <select className="filter-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                {months.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              {!isProcessed && displayData.length > 0 && (
                <button className="btn btn-primary btn-sm" onClick={processPayroll} disabled={processing}>
                  <i className="fas fa-check-circle" /> {processing ? "Processing..." : "Process Payroll"}
                </button>
              )}
              {isProcessed && (
                <span className="badge badge-success" style={{ padding: "6px 12px" }}>Processed</span>
              )}
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>CTC</th>
                  <th>Gross</th>
                  <th>Deductions</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayData.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>No employees found. Add employees first.</td></tr>
                ) : (
                  displayData.map((p) => {
                    const emp = p.emp || EMPLOYEES_DATA.find((e) => e.id === p.employeeId);
                    if (!emp) return null;
                    return (
                      <tr key={p.employeeId} className="clickable-row" onClick={() => openPayslip(p)}>
                        <td>
                          <div className="employee-cell">
                            <Avatar name={emp.name} initials={emp.avatar} avatarUrl={emp.avatarUrl} />
                            <div><div className="name">{emp.name}</div><div className="sub">{emp.employeeId}</div></div>
                          </div>
                        </td>
                        <td className="salary-cell">{formatCurrency(p.ctc)}</td>
                        <td className="salary-cell">{formatCurrency(p.grossEarnings)}</td>
                        <td className="salary-cell" style={{ color: "var(--danger)" }}>{formatCurrency(p.totalDeductions)}</td>
                        <td className="salary-cell font-semibold">{formatCurrency(p.netPay)}</td>
                        <td><Badge status={p.status === "processed" || p.status === "paid" ? "paid" : "pending"} /></td>
                        <td>
                          <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); openPayslip(p); }}>
                            <i className="fas fa-eye" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
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
  if (!emp) return null;
  const pfAccountNo = `PYBNG00631020000${(emp.id || 0).toString().padStart(3, "0")}28 JXOPE1760A`;

  async function downloadPDF() {
    const el = document.getElementById("payslip-print");
    if (!el) return;
    const html2canvas = (await import("html2canvas-pro")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, w, h);
    pdf.save(`payslip-${emp.name?.replace(/\s+/g, "-")}-${data.month?.replace(/\s+/g, "-")}.pdf`);
  }

  return (
    <div className="payslip-doc" id="payslip-print">
      <div className="payslip-doc-close" style={{ display: "flex", gap: 8 }}>
        <button style={{ background: "#f1f1f1", border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: "0.85rem", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={downloadPDF} title="Download PDF"><i className="fas fa-download" /></button>
        <button style={{ background: "#f1f1f1", border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: "0.85rem", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}><i className="fas fa-times" /></button>
      </div>

      <div className="payslip-doc-header">
        <div>
          <h1 className="payslip-doc-title">PAYSLIP <span>{data.month?.toUpperCase()}</span></h1>
          <p className="payslip-doc-company">COPAN SERVICES PRIVATE LIMITED</p>
          <p className="payslip-doc-address">FLAT NUMBER 5, 3RD FLOOR, HIBISCUS PARK</p>
          <p className="payslip-doc-address">SECTOR 25</p>
          <p className="payslip-doc-address">Panchkula, Haryana 134116</p>
        </div>
        <div className="payslip-doc-logo"><img src={copanLogo} alt="Copan" /></div>
      </div>

      <div className="payslip-doc-divider" />

      <h3 className="payslip-doc-emp-name">{emp.name?.toUpperCase()}</h3>
      <table className="payslip-doc-info-table">
        <tbody>
          <tr>
            <td className="payslip-doc-info-label">Employee ID</td>
            <td className="payslip-doc-info-value">{emp.employeeId}</td>
            <td className="payslip-doc-info-label">Date of Joining</td>
            <td className="payslip-doc-info-value">{emp.joinDate ? formatDate(emp.joinDate) : "—"}</td>
            <td className="payslip-doc-info-label">Department</td>
            <td className="payslip-doc-info-value">{emp.department}</td>
          </tr>
          <tr>
            <td className="payslip-doc-info-label">Designation</td>
            <td className="payslip-doc-info-value">{emp.designation}</td>
            <td className="payslip-doc-info-label">Bank Account Number</td>
            <td className="payslip-doc-info-value">{emp.bankAccount || "—"}</td>
            <td className="payslip-doc-info-label">Location</td>
            <td className="payslip-doc-info-value">{emp.location}</td>
          </tr>
          <tr>
            <td className="payslip-doc-info-label">Payment Mode</td>
            <td className="payslip-doc-info-value">{emp.paymentMode || "Bank Transfer"}</td>
            <td className="payslip-doc-info-label">Bank Name</td>
            <td className="payslip-doc-info-value">{emp.bankName || "—"}</td>
            <td className="payslip-doc-info-label">Permanent Account Number</td>
            <td className="payslip-doc-info-value">{emp.pan || "—"}</td>
          </tr>
        </tbody>
      </table>

      <div className="payslip-doc-divider" />

      <h4 className="payslip-doc-section-title">SALARY DETAILS</h4>
      <table className="payslip-doc-salary-summary">
        <thead><tr><th>Number of Payable Days</th><th>Gross Working Days</th><th>Loss of Pay Days</th><th>Days Payable</th></tr></thead>
        <tbody><tr><td>{data.totalWorkingDays}.0</td><td>{data.totalWorkingDays}.0</td><td>{data.unpaidLeaveDays > 0 ? Number(data.unpaidLeaveDays).toFixed(2) : "0.00"}</td><td>{data.payableDays}</td></tr></tbody>
      </table>

      <div className="payslip-doc-divider" />

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
              <tr className="payslip-doc-total-row"><td><strong>Total Earnings (A)</strong></td><td className="payslip-doc-amount"><strong>{formatCurrency(data.grossEarnings)}</strong></td></tr>
            </tbody>
          </table>
        </div>
        <div className="payslip-doc-contributions">
          <h4 className="payslip-doc-col-title">CONTRIBUTIONS</h4>
          <table className="payslip-doc-table">
            <tbody>
              <tr><td>Provident Fund - Employee</td><td className="payslip-doc-amount">{formatCurrency(data.pfEmployee)}</td></tr>
              <tr><td>Provident Fund - Employer</td><td className="payslip-doc-amount">{formatCurrency(data.pfEmployer)}</td></tr>
              <tr className="payslip-doc-total-row"><td><strong>Total Contributions (B)</strong></td><td className="payslip-doc-amount"><strong>{formatCurrency(data.pfEmployee + data.pfEmployer)}</strong></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="payslip-doc-divider" />

      <table className="payslip-doc-net-table">
        <tbody>
          <tr><td className="payslip-doc-net-label">Net Salary Payable ( A - B )</td><td className="payslip-doc-net-value">{formatCurrency(data.netPay)}</td></tr>
          <tr><td className="payslip-doc-net-label">Net Salary in words</td><td className="payslip-doc-net-words">{numberToWords(data.netPay)}</td></tr>
        </tbody>
      </table>

      <div className="payslip-doc-divider" />

      <p className="payslip-doc-note"><strong>*Note -</strong> All amounts displayed in this payslip are in <strong>Indian Rupees (INR)</strong></p>
      <p className="payslip-doc-disclaimer">* This is a computer generated statement does not require signature.</p>
    </div>
  );
}
