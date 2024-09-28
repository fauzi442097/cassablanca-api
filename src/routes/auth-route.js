const express = require("express");

const authController = require("../controllers/auth-controller");
const validateRequest = require("../middleware/validate-request");
const {
  requestOTPValidation,
  requestVerifyOtpValidation,
  signUpSchema,
} = require("../validation/user-validation");

const router = express.Router();
router.post(
  "/request-otp",
  validateRequest(requestOTPValidation),
  authController.requestOTP
);
router.post(
  "/verify-otp",
  validateRequest(requestVerifyOtpValidation),
  authController.verifyOTP
);
router.post("/sign-up", validateRequest(signUpSchema), authController.signUp);

router.get("/user/:userId", authController.getUser);

module.exports = router;
