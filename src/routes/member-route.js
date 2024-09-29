const express = require("express");
const memberController = require("../controllers/member-controller");
const orderController = require("../controllers/order-controller");

const validateRequest = require("../middleware/validate-request");
const { registerMemberSchema } = require("../validation/user-validation");
const authorize = require("../middleware/authorize");
const { ROLE } = require("../utils/ref-value");
const { confirmPaymentSchema } = require("../validation/order-validation");
const { withdrawalSchema } = require("../validation/member-validation");

const router = express.Router();

router.get(
  "/activation/request",
  authorize([ROLE.MEMBER]),
  memberController.activationRequest
);
router.post(
  "/payment/confirm",
  authorize([ROLE.MEMBER]),
  validateRequest(confirmPaymentSchema),
  orderController.confirmPayment
);

router.get(
  "/",
  authorize([ROLE.ADMIN_CASSABLANCA]),
  memberController.getMembers
);

router.get(
  "/:memberId/wallet",
  authorize([ROLE.MEMBER]),
  memberController.getWalletMember
);

router.post(
  "/:memberId/withdrawal",
  authorize([ROLE.MEMBER]),
  validateRequest(withdrawalSchema),
  memberController.requestWithdrawal
);

router.get("/tree", memberController.memberTree);
router.get("/tree/:parentId", memberController.memberTree);

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

router.post(
  "/:memberId/verification",
  authorize([ROLE.ADMIN_CASSABLANCA]),
  memberController.verificationMember
);

router.post(
  "/:memberId/reject-verification",
  authorize([ROLE.ADMIN_CASSABLANCA]),
  memberController.rejectVerificationMember
);
router.post(
  "/:memberId/block",
  authorize([ROLE.ADMIN_CASSABLANCA]),
  memberController.blockMember
);

module.exports = router;
