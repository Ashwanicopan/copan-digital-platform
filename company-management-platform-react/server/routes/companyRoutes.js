const router = require("express").Router();
const ctrl = require("../controllers/companyController");
const { auth, roleCheck } = require("../middleware/auth");

router.get("/", auth, ctrl.get);
router.put("/", auth, roleCheck("admin"), ctrl.update);

module.exports = router;
