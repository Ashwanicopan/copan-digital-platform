const Holiday = require("../models/Holiday");

exports.getAll = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUpcoming = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const holidays = await Holiday.find({ date: { $gte: today } }).sort({ date: 1 }).limit(5);
    res.json(holidays);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const holiday = await Holiday.create(req.body);
    res.status(201).json(holiday);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Holiday.findByIdAndDelete(req.params.id);
    res.json({ message: "Holiday deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
