const router = require("express").Router();
const ctrl = require("../controllers/payrollController");
const { auth, roleCheck } = require("../middleware/auth");

router.get("/", auth, roleCheck("admin"), ctrl.getAll);
router.get("/summary", auth, roleCheck("admin"), ctrl.getSummary);
router.get("/preview", auth, roleCheck("admin"), ctrl.preview);
router.get("/employee/:employeeId", auth, ctrl.getByEmployee);
router.post("/process", auth, roleCheck("admin"), ctrl.processPayroll);
router.post("/mark-paid", auth, roleCheck("admin"), ctrl.markPaid);

module.exports = router;
