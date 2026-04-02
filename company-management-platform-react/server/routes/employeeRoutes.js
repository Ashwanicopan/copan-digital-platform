const router = require("express").Router();
const ctrl = require("../controllers/employeeController");
const { auth, roleCheck } = require("../middleware/auth");

router.get("/", auth, ctrl.getAll);
router.get("/:id", auth, ctrl.getById);
router.post("/", auth, roleCheck("admin"), ctrl.create);
router.put("/:id", auth, roleCheck("admin"), ctrl.update);
router.delete("/:id", auth, roleCheck("admin"), ctrl.remove);

module.exports = router;
