const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["national", "festival"], default: "festival" },
}, { timestamps: true });

module.exports = mongoose.model("Holiday", holidaySchema);
