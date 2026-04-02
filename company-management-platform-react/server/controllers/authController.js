const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");
const Team = require("../models/Team");

function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Get team member IDs if manager
    let teamMemberIds = [];
    if (user.role === "manager" && user.employeeRef) {
      const teams = await Team.find({ manager: user.employeeRef });
      const ids = new Set();
      teams.forEach((t) => t.members.forEach((id) => ids.add(id.toString())));
      teamMemberIds = [...ids];
    }

    res.json({
      token: generateToken(user),
      user: {
        id: user._id,
        employeeRef: user.employeeRef,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isAdmin: user.role === "admin",
        isManager: user.role === "manager",
        teamMemberIds,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    let teamMemberIds = [];
    if (user.role === "manager" && user.employeeRef) {
      const teams = await Team.find({ manager: user.employeeRef });
      const ids = new Set();
      teams.forEach((t) => t.members.forEach((id) => ids.add(id.toString())));
      teamMemberIds = [...ids];
    }
    res.json({
      id: user._id,
      employeeRef: user.employeeRef,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isAdmin: user.role === "admin",
      isManager: user.role === "manager",
      teamMemberIds,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
