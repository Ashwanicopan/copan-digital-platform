const Attendance = require("../models/Attendance");

const SHIFT_START_HOUR = 9;
const SHIFT_START_MIN = 30;
const LATE_GRACE_MINUTES = 15;

function checkLate(clockInStr) {
  if (!clockInStr) return { isLate: false, lateByMinutes: 0 };
  const [h, m] = clockInStr.split(":").map(Number);
  const clockInMin = h * 60 + m;
  const shiftMin = SHIFT_START_HOUR * 60 + SHIFT_START_MIN + LATE_GRACE_MINUTES;
  if (clockInMin > shiftMin) {
    return { isLate: true, lateByMinutes: clockInMin - (SHIFT_START_HOUR * 60 + SHIFT_START_MIN) };
  }
  return { isLate: false, lateByMinutes: 0 };
}

exports.getByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = {};
    if (date) {
      const d = new Date(date);
      filter.date = { $gte: new Date(d.setHours(0, 0, 0, 0)), $lte: new Date(d.setHours(23, 59, 59, 999)) };
    }
    const records = await Attendance.find(filter).populate("employee", "name email department avatar employeeId designation");
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clockIn = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();
    const clockIn = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

    let record = await Attendance.findOne({ employee: employeeId, date: today });
    if (record && record.clockIn) {
      return res.status(400).json({ message: "Already clocked in today" });
    }

    const { isLate, lateByMinutes } = checkLate(clockIn);

    if (record) {
      record.clockIn = clockIn;
      record.status = "present";
      record.isLate = isLate;
      record.lateByMinutes = lateByMinutes;
      await record.save();
    } else {
      record = await Attendance.create({
        employee: employeeId, date: today, clockIn,
        status: "present", isLate, lateByMinutes,
      });
    }

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clockOut = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await Attendance.findOne({ employee: employeeId, date: today });
    if (!record || !record.clockIn) return res.status(400).json({ message: "Not clocked in today" });
    if (record.clockOut) return res.status(400).json({ message: "Already clocked out today" });

    const clockOut = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    const [inH, inM] = record.clockIn.split(":").map(Number);
    const [outH, outM] = clockOut.split(":").map(Number);
    const hours = parseFloat(((outH * 60 + outM - inH * 60 - inM) / 60).toFixed(1));

    // Less than 4 hours = half day
    record.clockOut = clockOut;
    record.hours = hours;
    if (hours < 4) record.status = "half-day";
    await record.save();

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { employee: req.params.employeeId };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter).sort({ date: -1 }).limit(60);

    // Calculate summary
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.isLate && !r.isRegularized).length;
    const halfDays = records.filter((r) => r.status === "half-day").length;
    const avgHours = present > 0
      ? parseFloat((records.filter((r) => r.hours > 0).reduce((s, r) => s + r.hours, 0) / present).toFixed(1))
      : 0;

    res.json({
      records,
      summary: { present, absent, late, halfDays, avgHours, total: records.length },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
