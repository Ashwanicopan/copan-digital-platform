const Company = require("../models/Company");

exports.get = async (req, res) => {
  try {
    const company = await Company.findOne();
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const company = await Company.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(company);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
