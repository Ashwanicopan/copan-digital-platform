const router = require("express").Router();
const ctrl = require("../controllers/regularizationController");
const { auth, roleCheck } = require("../middleware/auth");

router.get("/", auth, roleCheck("admin", "manager"), ctrl.getAll);
router.get("/employee/:employeeId", auth, ctrl.getMyRequests);
router.post("/", auth, ctrl.create);
router.patch("/:id/status", auth, roleCheck("admin", "manager"), ctrl.updateStatus);

module.exports = router;
