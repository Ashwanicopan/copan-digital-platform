const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  location: { type: String },
  joinDate: { type: Date, required: true },
  dob: { type: Date },
  salary: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "on-leave", "inactive"], default: "active" },
  avatar: { type: String },
  manager: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);
