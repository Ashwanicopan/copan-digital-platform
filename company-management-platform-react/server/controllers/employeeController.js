const Employee = require("../models/Employee");
const LeaveBalance = require("../models/LeaveBalance");

exports.getAll = async (req, res) => {
  try {
    const { department, status, search } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }
    const employees = await Employee.find(filter).sort({ name: 1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    const leaveBalance = await LeaveBalance.findOne({ employee: employee._id });
    res.json({ ...employee.toObject(), leaveBalance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const count = await Employee.countDocuments();
    const employeeId = "CD-" + (1001 + count);
    const initials = req.body.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    const employee = await Employee.create({ ...req.body, employeeId, avatar: initials });
    await LeaveBalance.create({ employee: employee._id });
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    await LeaveBalance.deleteOne({ employee: employee._id });
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
