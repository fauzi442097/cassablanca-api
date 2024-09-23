const express = require("express");

const configController = require("../controllers/config-controller");
const validateRequest = require("../middleware/validate-request");
const {
  configBonusSchema,
  configLevelSchema,
} = require("../validation/ranking-validation");

const router = express.Router();
// LEVEL
router.get("/level", configController.getLevel);
router.get("/level/:rankingId", configController.getLevelByRankingId);
router.put(
  "/level/:rankingId",
  validateRequest(configLevelSchema),
  configController.updateLevel
);

// BONUS
router.get("/bonus", configController.getRankingBonus);
router.get("/bonus/:rankingId", configController.getRakingBonusById);
router.put(
  "/bonus/:rankingId",
  validateRequest(configBonusSchema),
  configController.updateRankingBonus
);

module.exports = router;
