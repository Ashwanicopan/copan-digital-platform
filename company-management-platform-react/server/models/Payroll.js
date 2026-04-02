const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  month: { type: String, required: true }, // "April 2026"
  year: { type: Number, required: true },
  monthNum: { type: Number, required: true }, // 1-12

  // Days breakdown
  totalCalendarDays: { type: Number, required: true },
  weekends: { type: Number, required: true },
  holidays: { type: Number, required: true },
  totalWorkingDays: { type: Number, required: true },
  presentDays: { type: Number, default: 0 },
  paidLeaveDays: { type: Number, default: 0 },
  unpaidLeaveDays: { type: Number, default: 0 }, // LOP
  lateDays: { type: Number, default: 0 },
  lateDeductionDays: { type: Number, default: 0 }, // every 3 lates = 0.5 day LOP
  halfDays: { type: Number, default: 0 },
  payableDays: { type: Number, required: true },

  // Earnings
  ctc: { type: Number, required: true }, // monthly CTC
  basic: { type: Number, required: true },
  hra: { type: Number, required: true },
  specialAllowance: { type: Number, default: 0 },
  conveyanceAllowance: { type: Number, default: 0 },
  medicalAllowance: { type: Number, default: 0 },
  otherAllowances: { type: Number, default: 0 },
  grossEarnings: { type: Number, required: true },

  // Deductions
  pfEmployee: { type: Number, default: 0 }, // 12% of basic, capped
  pfEmployer: { type: Number, default: 0 },
  professionalTax: { type: Number, default: 0 },
  tds: { type: Number, default: 0 },
  lopDeduction: { type: Number, default: 0 },
  otherDeductions: { type: Number, default: 0 },
  totalDeductions: { type: Number, required: true },

  // Final
  netPay: { type: Number, required: true },
  status: { type: String, enum: ["draft", "processed", "paid"], default: "draft" },
  paidOn: { type: Date },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

payrollSchema.index({ employee: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Payroll", payrollSchema);
