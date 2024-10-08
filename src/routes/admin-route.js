const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin-controller");
const authorize = require("../middleware/authorize");
const { ROLE } = require("../utils/ref-value");
const validateRequest = require("../middleware/validate-request");
const { idMembersSchema } = require("../validation/member-validation");

router.get(
  "/wallet",
  authorize([ROLE.ADMIN_CASSABLANCA]),
  adminController.walletAdmin
);

router.get(
  "/bonus/member/:bonusStatus",
  authorize([ROLE.ADMIN_CONTINENTAL]),
  adminController.bonusMember
);

router.post(
  "/bonus/member/distribute",
  authorize([ROLE.ADMIN_CONTINENTAL]),
  validateRequest(idMembersSchema),
  adminController.distributeBonus
);

router.get(
  "/order/history-verification",
  authorize([ROLE.ADMIN_CASSABLANCA]),
  adminController.historyVerification
);

router.get(
  "/withdrawal",
  authorize([ROLE.ADMIN_CONTINENTAL]),
  adminController.withdrawalMember
);
router.post(
  "/withdrawal/:withdrawalId/reject",
  authorize([ROLE.ADMIN_CONTINENTAL]),
  adminController.rejectWithdrawal
);
router.post(
  "/withdrawal/:withdrawalId/approve",
  authorize([ROLE.ADMIN_CONTINENTAL]),
  adminController.approveWithdrawal
);

module.exports = router;
