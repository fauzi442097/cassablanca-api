const express = require("express");

const rankingController = require("../controllers/config/ranking-controller");
const validateRequest = require("../middleware/validate-request");
const { levelSchema } = require("../validation/ranking-validation");

const router = express.Router();

// LEVEL
router.get("/level", rankingController.getLevel);
router.get("/level/:rankingId", rankingController.getLevelByRankingId);
router.put(
  "/level/:levelId",
  validateRequest(levelSchema),
  rankingController.updateLevel
);
router.post(
  "/level",
  validateRequest(levelSchema),
  rankingController.createLevel
);
router.delete("/level/:levelId", rankingController.deleteLevel);

// PRODUCT

module.exports = router;
