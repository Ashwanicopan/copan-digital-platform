const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Holiday = require("../models/Holiday");

// ─── Payroll Configuration ───
const SHIFT_START = "09:30"; // Standard shift start time
const LATE_THRESHOLD_MINUTES = 15; // Grace period
const LATES_PER_LOP = 3; // 3 late marks = 0.5 day LOP
const LOP_PER_LATE_SET = 0.5;
const PF_RATE = 0.12;
const PF_BASIC_CAP = 15000; // PF calculated on basic up to ₹15,000
const PT_AMOUNT = 200; // Professional Tax per month

// ─── Tax Slabs (New Regime FY 2026-27) ───
function calculateAnnualTDS(annualTaxable) {
  let tax = 0;
  const slabs = [
    { limit: 400000, rate: 0 },
    { limit: 400000, rate: 0.05 },
    { limit: 400000, rate: 0.10 },
    { limit: 400000, rate: 0.15 },
    { limit: 400000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 },
  ];
  let remaining = annualTaxable;
  for (const slab of slabs) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, slab.limit);
    tax += taxable * slab.rate;
    remaining -= taxable;
  }
  // 4% cess
  tax += tax * 0.04;
  return Math.round(tax);
}

// ─── Helper: Count weekends in a month ───
function countWeekends(year, month) {
  let count = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(year, month - 1, d).getDay();
    if (day === 0 || day === 6) count++;
  }
  return count;
}

// ─── Process payroll for one employee ───
async function calculatePayroll(employeeId, monthNum, year) {
  const employee = await Employee.findById(employeeId);
  if (!employee) throw new Error("Employee not found");

  const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthLabel = `${monthNames[monthNum]} ${year}`;
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  // 1. Calendar calculations
  const weekends = countWeekends(year, monthNum);

  const monthStart = new Date(year, monthNum - 1, 1);
  const monthEnd = new Date(year, monthNum, 0, 23, 59, 59);
  const holidaysInMonth = await Holiday.countDocuments({
    date: { $gte: monthStart, $lte: monthEnd },
  });

  const totalWorkingDays = daysInMonth - weekends - holidaysInMonth;

  // 2. Attendance analysis
  const attendanceRecords = await Attendance.find({
    employee: employeeId,
    date: { $gte: monthStart, $lte: monthEnd },
  });

  let presentDays = 0;
  let lateDays = 0;
  let halfDays = 0;

  attendanceRecords.forEach((rec) => {
    if (rec.status === "present") {
      presentDays++;
      if (rec.isLate && !rec.isRegularized) lateDays++;
    } else if (rec.status === "half-day") {
      halfDays++;
      presentDays += 0.5;
    }
  });

  // 3. Leave analysis
  const approvedLeaves = await Leave.find({
    employee: employeeId,
    status: "approved",
    $or: [
      { from: { $gte: monthStart, $lte: monthEnd } },
      { to: { $gte: monthStart, $lte: monthEnd } },
    ],
  });

  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;

  approvedLeaves.forEach((leave) => {
    const leaveStart = new Date(Math.max(leave.from, monthStart));
    const leaveEnd = new Date(Math.min(leave.to, monthEnd));
    let leaveDaysInMonth = 0;
    for (let d = new Date(leaveStart); d <= leaveEnd; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) leaveDaysInMonth++;
    }

    if (leave.type === "Comp Off") {
      // Comp off doesn't count as leave deduction
    } else {
      paidLeaveDays += leaveDaysInMonth;
    }
  });

  // If leaves exceed balance, they become unpaid (LOP)
  // Simplified: treat all approved leaves as paid for now
  // In production, check against LeaveBalance

  // 4. Late deduction: every 3 lates = 0.5 day LOP
  const lateDeductionDays = Math.floor(lateDays / LATES_PER_LOP) * LOP_PER_LATE_SET;

  // 5. Calculate payable days
  const totalAbsentDays = totalWorkingDays - presentDays - paidLeaveDays - (halfDays * 0.5);
  unpaidLeaveDays = Math.max(0, totalAbsentDays) + lateDeductionDays;
  const payableDays = Math.max(0, totalWorkingDays - unpaidLeaveDays);

  // 6. Salary components
  const monthlyCTC = employee.salary;
  const basic = Math.round(monthlyCTC * 0.50);
  const hra = Math.round(basic * 0.40);
  const pfEmployer = Math.round(Math.min(basic, PF_BASIC_CAP) * PF_RATE);
  const specialAllowance = Math.max(0, monthlyCTC - basic - hra - pfEmployer);
  const conveyanceAllowance = 1600;
  const medicalAllowance = 1250;

  const grossEarnings = basic + hra + specialAllowance + conveyanceAllowance + medicalAllowance;

  // 7. Deductions
  const pfEmployee = Math.round(Math.min(basic, PF_BASIC_CAP) * PF_RATE);
  const professionalTax = PT_AMOUNT;

  // TDS: annualize, compute tax, divide by 12
  const annualTaxable = (grossEarnings - pfEmployee) * 12 - 75000; // Standard deduction ₹75,000
  const annualTDS = calculateAnnualTDS(Math.max(0, annualTaxable));
  const tds = Math.round(annualTDS / 12);

  // LOP deduction
  const perDaySalary = grossEarnings / totalWorkingDays;
  const lopDeduction = Math.round(perDaySalary * unpaidLeaveDays);

  const totalDeductions = pfEmployee + professionalTax + tds + lopDeduction;
  const netPay = Math.round(grossEarnings - totalDeductions);

  return {
    employee: employeeId,
    month: monthLabel,
    year,
    monthNum,
    totalCalendarDays: daysInMonth,
    weekends,
    holidays: holidaysInMonth,
    totalWorkingDays,
    presentDays: Math.round(presentDays * 10) / 10,
    paidLeaveDays,
    unpaidLeaveDays: Math.round(unpaidLeaveDays * 10) / 10,
    lateDays,
    lateDeductionDays,
    halfDays,
    payableDays: Math.round(payableDays * 10) / 10,
    ctc: monthlyCTC,
    basic,
    hra,
    specialAllowance,
    conveyanceAllowance,
    medicalAllowance,
    otherAllowances: 0,
    grossEarnings,
    pfEmployee,
    pfEmployer,
    professionalTax,
    tds,
    lopDeduction,
    otherDeductions: 0,
    totalDeductions,
    netPay,
    status: "draft",
  };
}

// ─── Controllers ───

exports.getAll = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = {};
    if (month) filter.month = month;
    const records = await Payroll.find(filter)
      .populate("employee", "name avatar employeeId email department designation")
      .sort({ "employee.name": 1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getByEmployee = async (req, res) => {
  try {
    const records = await Payroll.find({ employee: req.params.employeeId }).sort({ year: -1, monthNum: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Process payroll for all employees for a given month
exports.processPayroll = async (req, res) => {
  try {
    const { monthNum, year } = req.body;
    if (!monthNum || !year) return res.status(400).json({ message: "monthNum and year are required" });

    const employees = await Employee.find({ status: { $ne: "inactive" } });
    const results = [];

    for (const emp of employees) {
      try {
        const payrollData = await calculatePayroll(emp._id, monthNum, year);
        // Upsert: update if exists, create if not
        const record = await Payroll.findOneAndUpdate(
          { employee: emp._id, month: payrollData.month },
          { ...payrollData, processedBy: req.user._id },
          { upsert: true, new: true }
        );
        results.push(record);
      } catch (err) {
        console.error(`Payroll error for ${emp.name}:`, err.message);
      }
    }

    const populated = await Payroll.find({ month: `${["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][monthNum]} ${year}` })
      .populate("employee", "name avatar employeeId email department designation");

    res.json({ message: `Payroll processed for ${results.length} employees`, data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark payroll as paid
exports.markPaid = async (req, res) => {
  try {
    const { month } = req.body;
    await Payroll.updateMany({ month, status: { $ne: "paid" } }, { status: "paid", paidOn: new Date() });
    res.json({ message: "Payroll marked as paid" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get payroll summary for a month
exports.getSummary = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = {};
    if (month) filter.month = month;

    const records = await Payroll.find(filter);
    const summary = {
      totalEmployees: records.length,
      totalGross: records.reduce((s, r) => s + r.grossEarnings, 0),
      totalDeductions: records.reduce((s, r) => s + r.totalDeductions, 0),
      totalNetPay: records.reduce((s, r) => s + r.netPay, 0),
      totalPF: records.reduce((s, r) => s + r.pfEmployee + r.pfEmployer, 0),
      totalTDS: records.reduce((s, r) => s + r.tds, 0),
      totalLOP: records.reduce((s, r) => s + r.lopDeduction, 0),
      paidCount: records.filter((r) => r.status === "paid").length,
      pendingCount: records.filter((r) => r.status !== "paid").length,
    };
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Preview payroll for a single employee (without saving)
exports.preview = async (req, res) => {
  try {
    const { employeeId, monthNum, year } = req.query;
    const payroll = await calculatePayroll(employeeId, Number(monthNum), Number(year));
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
