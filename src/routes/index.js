const express = require("express");

const authRouter = require("./auth-route.js");
const referensiRoute = require("./ref-route.js");
const configRoute = require("./config-route.js");
const auditRoute = require("./audit.route.js");
const memberRoute = require("./member-route.js");
const adminRoute = require("./admin-route.js");
const dashboardRoute = require("./dashboard-route.js");

const userController = require("../controllers/user-controller.js");
const referensiController = require("../controllers/referensi-controller.js");

const authorize = require("../middleware/authorize.js");
const { ROLE } = require("../utils/ref-value.js");

const router = express.Router();
router.use("/ref", referensiRoute);
router.use("/config", authorize([ROLE.ADMIN_CONTINENTAL]), configRoute);
router.use("/audits", auditRoute);
router.use("/member", memberRoute);
router.use("/dashboard", dashboardRoute);

router.get("/profile", userController.profile);
router.put("/profile", userController.updateProfile);
router.get("/minimum-withdrawal", referensiController.minimumWithdrawal);

router.use(authRouter);
router.use(adminRoute);


module.exports = router;
