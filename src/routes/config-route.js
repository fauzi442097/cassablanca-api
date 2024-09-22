const express = require("express");

const configController = require("../controllers/config-controller");

const router = express.Router();
router.get("/ranking", configController.getAll);

module.exports = router;
