const Regularization = require("../models/Regularization");
const Attendance = require("../models/Attendance");
const Team = require("../models/Team");

exports.getAll = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;

    // Managers see only their team members' requests
    if (req.user.role === "manager") {
      const teams = await Team.find({ manager: req.user.employeeRef });
      const memberIds = [];
      teams.forEach((t) => t.members.forEach((id) => memberIds.push(id)));
      filter.employee = { $in: memberIds };
    }

    const requests = await Regularization.find(filter)
      .populate("employee", "name avatar employeeId department")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Regularization.find({ employee: req.params.employeeId })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { employeeId, employeeName, date, type, originalClockIn, originalClockOut, requestedClockIn, requestedClockOut, reason } = req.body;

    const request = await Regularization.create({
      employee: employeeId,
      employeeName,
      date,
      type,
      originalClockIn,
      originalClockOut,
      requestedClockIn,
      requestedClockOut,
      reason,
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const request = await Regularization.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Check permission for managers
    if (req.user.role === "manager") {
      const teams = await Team.find({ manager: req.user.employeeRef });
      const memberIds = new Set();
      teams.forEach((t) => t.members.forEach((id) => memberIds.add(id.toString())));
      if (!memberIds.has(request.employee.toString())) {
        return res.status(403).json({ message: "Not authorized for this employee" });
      }
    }

    request.status = status;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.remarks = remarks || "";
    await request.save();

    // If approved, update the attendance record
    if (status === "approved") {
      const dateStart = new Date(request.date);
      dateStart.setHours(0, 0, 0, 0);

      const update = {
        isRegularized: true,
        regularizationId: request._id,
        isLate: false,
        lateByMinutes: 0,
        status: "present",
      };

      if (request.requestedClockIn) update.clockIn = request.requestedClockIn;
      if (request.requestedClockOut) update.clockOut = request.requestedClockOut;

      // Recalculate hours if both times exist
      if (request.requestedClockIn && request.requestedClockOut) {
        const [inH, inM] = request.requestedClockIn.split(":").map(Number);
        const [outH, outM] = request.requestedClockOut.split(":").map(Number);
        update.hours = parseFloat(((outH * 60 + outM - inH * 60 - inM) / 60).toFixed(1));
      }

      await Attendance.findOneAndUpdate(
        { employee: request.employee, date: dateStart },
        update,
        { upsert: true }
      );
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
