const express = require("express");

const auditController = require("../controllers/audit-controller");

const router = express.Router();
router.get("/", auditController.getAllData);
router.get("/:auditId", auditController.getDataById);

module.exports = router;
