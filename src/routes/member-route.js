const exporess = require("express");
const memberController = require("../controllers/member-controller");
const validateRequest = require("../middleware/validate-request");
const {
  confirmPaymentSchema,
  registerMemberSchema,
} = require("../validation/user-validation");
const authorize = require("../middleware/authorize");
const { ROLE } = require("../utils/ref-value");

const router = exporess.Router();

router.get(
  "/activation/request",
  authorize([ROLE.MEMBER]),
  memberController.activationRequest
);
router.post(
  "/payment/confirm",
  authorize([ROLE.MEMBER]),
  validateRequest(confirmPaymentSchema),
  memberController.confirmPayment
);

router.get(
  "/",
  authorize([ROLE.ADMIN_CASSABLANCA]),
  memberController.getAllMember
);

router.get(
  "/:memberId/downline",
  authorize([ROLE.ADMIN_CASSABLANCA, ROLE.MEMBER]),
  memberController.getDownlineMember
);
router.post(
  "/register",
  validateRequest(registerMemberSchema),
  memberController.registerMember
);

module.exports = router;
