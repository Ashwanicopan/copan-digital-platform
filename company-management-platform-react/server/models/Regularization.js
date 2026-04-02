const mongoose = require("mongoose");

const regularizationSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  employeeName: { type: String, required: true },
  date: { type: Date, required: true },
  type: {
    type: String,
    enum: ["late-arrival", "early-departure", "missed-punch", "forgot-clockin", "forgot-clockout", "work-from-home"],
    required: true,
  },
  originalClockIn: { type: String },
  originalClockOut: { type: String },
  requestedClockIn: { type: String },
  requestedClockOut: { type: String },
  reason: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: { type: Date },
  remarks: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Regularization", regularizationSchema);
