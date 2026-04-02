const router = require("express").Router();
const ctrl = require("../controllers/leaveController");
const { auth, roleCheck } = require("../middleware/auth");

router.get("/", auth, ctrl.getAll);
router.post("/", auth, ctrl.apply);
router.patch("/:id/status", auth, roleCheck("admin", "manager"), ctrl.updateStatus);
router.get("/balance/:employeeId", auth, ctrl.getBalance);

module.exports = router;
