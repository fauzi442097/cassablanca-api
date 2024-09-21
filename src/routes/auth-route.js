const exporess = require("express");

const authController = require("../controllers/auth-controller");
const validateRequest = require("../middleware/validate-request");
const {
  requestOTPValidation,
  requestVerifyOtpValidation,
} = require("../validation/user-validation");

const router = exporess.Router();
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

module.exports = router;
