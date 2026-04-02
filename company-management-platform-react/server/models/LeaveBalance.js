const mongoose = require("mongoose");

const leaveBalanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, unique: true },
  casual: { type: Number, default: 12 },
  sick: { type: Number, default: 7 },
  earned: { type: Number, default: 18 },
  compOff: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("LeaveBalance", leaveBalanceSchema);
