const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin-controller");
const authorize = require("../middleware/authorize");
const { ROLE } = require("../utils/ref-value");

router.get(
  "/wallet",
  authorize([ROLE.ADMIN_CASSABLANCA]),
  adminController.walletAdmin
);

module.exports = router;
