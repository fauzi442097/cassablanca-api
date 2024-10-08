const express = require("express");
const memberController = require("../controllers/member-controller");
const orderController = require("../controllers/order-controller");

const validateRequest = require("../middleware/validate-request");
const {
  registerMemberSchema,
  updateMemberSchema,
} = require("../validation/user-validation");
const authorize = require("../middleware/authorize");
const { ROLE } = require("../utils/ref-value");
const {
  confirmPaymentSchema,
  rejectConfirmPaymentSchema,
} = require("../validation/order-validation");
const { withdrawalSchema } = require("../validation/member-validation");
const {
  walletSchema,
  updateWalletSchema,
  verifyOTPWalletSchema,
  resendOTPWalletSchema,
  deletWalletSchema,
} = require("../validation/wallet-validation");

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
  authorize([ROLE.ADMIN_CASSABLANCA, ROLE.ADMIN_CONTINENTAL]),
  memberController.getMembers
);

router.put(
  "/:memberId",
  validateRequest(updateMemberSchema),
  memberController.updateMember
);

// WALLET
router.get(
  "/:memberId/wallet",
  authorize([ROLE.MEMBER]),
  memberController.getWalletMember
);

router.get(
  "/:memberId/wallet/:walletId",
  authorize([ROLE.MEMBER]),
  memberController.getSingeWallet
);

router.delete(
  "/:memberId/wallet/:walletId",
  authorize([ROLE.MEMBER]),
  validateRequest(deletWalletSchema),
  memberController.deleteWallet
);

router.post(
  "/wallet",
  authorize([ROLE.MEMBER]),
  validateRequest(walletSchema),
  memberController.createWallet
);

router.put(
  "/wallet/:walletId",
  authorize([ROLE.MEMBER]),
  validateRequest(updateWalletSchema),
  memberController.updateWallet
);

router.post(
  "/wallet/verify-otp",
  authorize([ROLE.MEMBER, ROLE.ADMIN_CONTINENTAL]),
  validateRequest(verifyOTPWalletSchema),
  memberController.verifyOTPWallet
);

router.post(
  "/wallet/verify-otp/resend",
  authorize([ROLE.MEMBER, ROLE.ADMIN_CONTINENTAL]),
  validateRequest(resendOTPWalletSchema),
  memberController.resendOTPWallet
);

// WITHDRAWAL
router.post(
  "/withdrawal",
  authorize([ROLE.MEMBER]),
  validateRequest(withdrawalSchema),
  memberController.requestWithdrawal
);

router.get(
  "/withdrawal",
  authorize([ROLE.MEMBER]),
  memberController.getTransactionWithdrawal
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

// VERIFICATION
router.get(
  "/verification",
  authorize([ROLE.ADMIN_CONTINENTAL]),
  memberController.listVerificationMember
);

router.post(
  "/:memberId/verification",
  authorize([ROLE.ADMIN_CONTINENTAL]),
  memberController.verificationMember
);

router.post(
  "/:memberId/reject-verification",
  validateRequest(rejectConfirmPaymentSchema),
  authorize([ROLE.ADMIN_CONTINENTAL]),
  memberController.rejectVerificationMember
);
router.post(
  "/:memberId/block",
  authorize([ROLE.ADMIN_CONTINENTAL]),
  memberController.blockMember
);
router.post(
  "/:memberId/unblock",
  authorize([ROLE.ADMIN_CONTINENTAL]),
  memberController.unBlockMember
);

// BALANCE
router.get(
  "/:memberId/balance",
  authorize([ROLE.MEMBER]),
  memberController.balanceMember
);

router.get(
  "/:memberId/balance/trx-history",
  authorize([ROLE.MEMBER, ROLE.ADMIN_CASSABLANCA]),
  memberController.historyTransactionBalance
);

module.exports = router;
