const express = require("express");

const configController = require("../controllers/config-controller");
const validateRequest = require("../middleware/validate-request");
const {
  configBonusSchema,
  levelSchema,
} = require("../validation/ranking-validation");

const router = express.Router();
// LEVEL
router.get("/level", configController.getLevel);
router.get("/level/:rankingId", configController.getLevelByRankingId);
router.put(
  "/level/:levelId",
  validateRequest(levelSchema),
  configController.updateLevel
);
router.post(
  "/level",
  validateRequest(levelSchema),
  configController.createLevel
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
