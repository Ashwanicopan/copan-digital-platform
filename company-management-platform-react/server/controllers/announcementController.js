const Announcement = require("../models/Announcement");

exports.getAll = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const announcement = await Announcement.create({ ...req.body, author: req.user.name });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
