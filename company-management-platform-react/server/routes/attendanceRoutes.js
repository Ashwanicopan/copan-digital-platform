const router = require("express").Router();
const ctrl = require("../controllers/attendanceController");
const { auth } = require("../middleware/auth");

router.get("/", auth, ctrl.getByDate);
router.post("/clock-in", auth, ctrl.clockIn);
router.post("/clock-out", auth, ctrl.clockOut);
router.get("/employee/:employeeId", auth, ctrl.getMyAttendance);

module.exports = router;
