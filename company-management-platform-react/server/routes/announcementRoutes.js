const router = require("express").Router();
const ctrl = require("../controllers/announcementController");
const { auth, roleCheck } = require("../middleware/auth");

router.get("/", auth, ctrl.getAll);
router.post("/", auth, roleCheck("admin"), ctrl.create);
router.delete("/:id", auth, roleCheck("admin"), ctrl.remove);

module.exports = router;
