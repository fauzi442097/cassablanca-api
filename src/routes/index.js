const express = require("express");
const logger = require("../config/logging.js");

const personRoute = require("./person-route.js");
const authRouter = require("./auth-route.js");

const router = express.Router();
router.use("/persons", personRoute);
router.use(authRouter);

router.get("/", (req, res) => {
  res.send("Welcome to API Cassablanca - MLM");
});

module.exports = router;
