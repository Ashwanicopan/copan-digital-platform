const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, required: true },
  clockIn: { type: String },
  clockOut: { type: String },
  status: { type: String, enum: ["present", "absent", "on-leave", "half-day", "weekend", "holiday"], default: "absent" },
  hours: { type: Number, default: 0 },
  isLate: { type: Boolean, default: false },
  lateByMinutes: { type: Number, default: 0 },
  isRegularized: { type: Boolean, default: false },
  regularizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Regularization" },
}, { timestamps: true });

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
