const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  employeeName: { type: String, required: true },
  type: { type: String, enum: ["Casual Leave", "Sick Leave", "Earned Leave", "Comp Off"], required: true },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  days: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);
