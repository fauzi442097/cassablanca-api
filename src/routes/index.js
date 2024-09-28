const express = require("express");

const authRouter = require("./auth-route.js");
const referensiRoute = require("./ref-route.js");
const configRoute = require("./config-route.js");
const auditRoute = require("./audit.route.js");
const memberRoute = require("./member-route.js");
const adminRoute = require("./admin-route.js");

const authorize = require("../middleware/authorize.js");
const { ROLE } = require("../utils/ref-value.js");

const router = express.Router();
router.use("/ref", referensiRoute);
router.use("/config", authorize([ROLE.ADMIN_CONTINENTAL]), configRoute);
router.use("/audits", auditRoute);
router.use("/member", memberRoute);

router.use(authRouter);
router.use(adminRoute);

router.get("/", (req, res) => {
  res.send("Welcome to API Cassablanca - MLM");
});

module.exports = router;
