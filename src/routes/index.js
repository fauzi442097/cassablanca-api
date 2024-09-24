const express = require("express");

const personRoute = require("./person-route.js");
const authRouter = require("./auth-route.js");
const referensiRoute = require("./ref-route.js");
const configRoute = require("./config-route.js");
const auditRoute = require("./audit.route.js");
const authorize = require("../middleware/authorize.js");
const { ROLE } = require("../utils/ref-value.js");

const router = express.Router();
router.use("/persons", personRoute);
router.use("/ref", referensiRoute);
router.use("/config", authorize([ROLE.ADMIN_CONTINENTAL]), configRoute);
router.use("/audits", auditRoute);
router.use(authRouter);

router.get("/", (req, res) => {
  res.send("Welcome to API Cassablanca - MLM");
});

module.exports = router;
