const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  departments: [String],
  locations: [String],
  industry: { type: String },
  size: { type: String },
  foundedYear: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);
