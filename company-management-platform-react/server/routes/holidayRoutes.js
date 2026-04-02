const router = require("express").Router();
const ctrl = require("../controllers/holidayController");
const { auth, roleCheck } = require("../middleware/auth");

router.get("/", auth, ctrl.getAll);
router.get("/upcoming", auth, ctrl.getUpcoming);
router.post("/", auth, roleCheck("admin"), ctrl.create);
router.delete("/:id", auth, roleCheck("admin"), ctrl.remove);

module.exports = router;
