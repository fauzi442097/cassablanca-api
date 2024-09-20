const exporess = require("express");

const authController = require("../controllers/auth-controller");

const router = exporess.Router();
router.post("/login", authController.login);

module.exports = router;
