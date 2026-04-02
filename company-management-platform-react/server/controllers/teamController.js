const Team = require("../models/Team");

exports.getAll = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("manager", "name avatar designation email employeeId")
      .populate("members", "name avatar designation email employeeId status");
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const team = await Team.create(req.body);
    const populated = await Team.findById(team._id)
      .populate("manager", "name avatar designation email employeeId")
      .populate("members", "name avatar designation email employeeId status");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("manager", "name avatar designation email employeeId")
      .populate("members", "name avatar designation email employeeId status");
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json({ message: "Team deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
