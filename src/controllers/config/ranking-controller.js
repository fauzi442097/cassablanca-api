const { tryCatch } = require("../../utils/helper");
const Response = require("../../utils/response-handler");
const rankingService = require("../../services/ranking-service");

const getLevel = tryCatch(async (req, res) => {
  const data = await rankingService.getRangkings();
  return Response.Success(res, data);
});

const getLevelByRankingId = tryCatch(async (req, res) => {
  const { rankingId } = req.params;
  const data = await rankingService.getRangkingById(rankingId);
  return Response.Success(res, data);
});

const updateLevel = tryCatch(async (req, res) => {
  const body = req.body;
  const { levelId } = req.params;
  await rankingService.updateRanking(levelId, body);
  return Response.Success(res, null, "Data has been saved successfully");
});

const createLevel = tryCatch(async (req, res) => {
  const body = req.body;
  await rankingService.createRankingWithRequirement(body);
  return Response.Success(res, null, "Data has been saved successfully");
});

const deleteLevel = tryCatch(async (req, res) => {
  const { levelId } = req.params;
  await rankingService.deleteRankingWithRequirement(levelId);
  return Response.Success(res, null, "Data has been deleted successfully");
});

module.exports = {
  getLevel,
  updateLevel,
  getLevelByRankingId,
  createLevel,
  deleteLevel,
};
