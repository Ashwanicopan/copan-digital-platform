const Leave = require("../models/Leave");
const LeaveBalance = require("../models/LeaveBalance");
const Team = require("../models/Team");

exports.getAll = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    const leaves = await Leave.find(filter).populate("employee", "name avatar employeeId").sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.apply = async (req, res) => {
  try {
    const { employeeId, employeeName, type, from, to, reason } = req.body;
    const days = Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1;
    const leave = await Leave.create({ employee: employeeId, employeeName, type, from, to, days, reason });
    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    // Check permission: admin can approve all, manager only team members
    if (req.user.role === "manager") {
      const teams = await Team.find({ manager: req.user.employeeRef });
      const memberIds = new Set();
      teams.forEach((t) => t.members.forEach((id) => memberIds.add(id.toString())));
      if (!memberIds.has(leave.employee.toString())) {
        return res.status(403).json({ message: "You can only approve/reject your team members' leaves" });
      }
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    await leave.save();
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const balance = await LeaveBalance.findOne({ employee: req.params.employeeId });
    if (!balance) return res.status(404).json({ message: "Balance not found" });
    res.json(balance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
