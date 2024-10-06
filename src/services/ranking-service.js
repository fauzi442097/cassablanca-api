const db = require("../config/database.js");
const initModels = require("../models/init-models.js");
const { withTransaction, toSnakeCase } = require("../utils/helper.js");
const ResponseError = require("../utils/response-error.js");
const { ranking, ranking_req, reff_ranking_req_type } = initModels(db);

const rankingRepository = require("../repositories/ranking-repository.js");
const rankingReqRepository = require("../repositories/ranking-req-repository.js");
const auditService = require("../services/audit-service.js");

const getRangkings = async () => {
  const data = await rankingRepository.getAll({
    include: [
      {
        model: ranking_req,
        attributes: [
          "id",
          "ranking_req_type_id",
          "value",
          "curr_id",
          "ranking_id_member",
        ],
        as: "ranking_reqs",
        include: [
          {
            model: reff_ranking_req_type,
            as: "ranking_req_type",
          },
          {
            attributes: ["id", "ranking_nm"],
            model: ranking,
            as: "ranking_member",
          },
        ],
      },
    ],
    order: [["lvl", "ASC"]],
  });
  return data;
};

const updateRanking = async (rankingId, data) => {
  const dataRanking = await rankingRepository.getDataById(rankingId);
  if (!dataRanking) throw new ResponseError("Data not found", 404);

  const prevRankingReq = await rankingReqRepository.getDataByRankingId(
    rankingId
  );
  const arrRankingReqId = prevRankingReq.map((item) => item.id);

  const DTORanking = {
    ranking_nm: data.level_name,
    direct_bonus: data.direct_bonus,
    ranking_bonus: data.ranking_bonus,
    global_bonus: data.global_sharing,
  };

  return withTransaction(async (transaction) => {
    const newDataRanking = await rankingRepository.updateRanking(
      rankingId,
      DTORanking,
      transaction
    );

    // Log Audit
    let dataAuditRanking = {
      event: "Update level",
      model_id: dataRanking.id,
      model_name: ranking.tableName,
      old_values: dataRanking,
    };
    dataAuditRanking = { ...dataAuditRanking, new_values: newDataRanking };
    await auditService.store(dataAuditRanking, transaction);

    await rankingReqRepository.deleteMultipe(arrRankingReqId);

    for (const item of data.level_requirement) {
      // INSERT NEW REQUIREMENT
      let DRORankingReq = {
        ranking_id: rankingId,
        ranking_req_type_id: item.id,
        ranking_id_member: item.level_id,
        value: item.value,
      };

      await rankingReqRepository.store(DRORankingReq, transaction);
    }

    let rankingReqAudit = {
      event: "Update level requirement",
      model_id: dataRanking.id,
      model_name: ranking_req.tableName,
      old_values: prevRankingReq,
      new_values: data.level_requirement,
    };
    await auditService.store(rankingReqAudit, transaction);
  });
};

const createRankingWithRequirement = async (data) => {
  const maxLevel = await ranking.max("lvl");
  const newLevel = (maxLevel || 0) + 1; // If maxLevel is null, start from 0
  const DTORanking = {
    id: toSnakeCase(data.level_name),
    ranking_nm: data.level_name,
    direct_bonus: data.direct_bonus,
    ranking_bonus: data.direct_bonus,
    global_sharing: data.direct_bonus,
    lvl: newLevel,
  };

  return withTransaction(async (transaction) => {
    const rankingCreated = await rankingRepository.store(
      DTORanking,
      transaction
    );

    // Log Audit
    let dataAuditRanking = {
      event: `Create level`,
      model_id: rankingCreated.id,
      model_name: ranking.tableName,
      new_values: rankingCreated,
    };
    await auditService.store(dataAuditRanking, transaction);

    for (const item of data.level_requirement) {
      const dataRankingReq = {
        ranking_id: rankingCreated.id,
        ranking_req_type_id: item.id,
        ranking_id_member: item.level_id,
        value: item.value,
      };

      const rankingReqCreated = await rankingReqRepository.store(
        dataRankingReq,
        transaction
      );

      let auditReqRanking = {
        event: `Create level requirement`,
        model_id: rankingReqCreated.id,
        model_name: ranking_req.tableName,
        new_values: rankingReqCreated,
      };
      await auditService.store(auditReqRanking, transaction);
    }
  });
};

const deleteRankingWithRequirement = async (rankingId) => {
  const dataRanking = await rankingRepository.getDataById(rankingId);
  if (!dataRanking) throw new ResponseError("Data not found", 404);

  const dataReqRanking = await rankingReqRepository.getDataByRankingId(
    rankingId
  );
  const arrIdDeleted = dataReqRanking.map((item) => item.id).join(", ");

  return withTransaction(async (transaction) => {
    // DELETE RANKING REQUIREMENT
    await rankingReqRepository.deleteByRankingId(rankingId, transaction);

    // Log Audit
    let dataAuditRanking = {
      event: `Delete level requirement`,
      model_id: arrIdDeleted,
      model_name: ranking_req.tableName,
      old_values: dataReqRanking,
    };
    await auditService.store(dataAuditRanking, transaction);

    // DELETE RANKING
    await rankingRepository.deleteById(rankingId, transaction);

    // Log Audit
    dataAuditRanking = {
      event: `Delete level`,
      model_id: dataRanking.id,
      model_name: ranking.tableName,
      old_values: dataRanking,
    };
    await auditService.store(dataAuditRanking, transaction);
  });
};

const getRangkingById = async (rankingId) => {
  const data = rankingRepository.getDataById(rankingId, {
    include: [
      {
        model: ranking_req,
        attributes: ["id", "ranking_req_type_id", "value", "curr_id"],
        as: "ranking_reqs",
        include: [
          {
            model: reff_ranking_req_type,
            as: "ranking_req_type",
          },
        ],
      },
    ],
  });

  if (!data) throw new ResponseError("Data not found", 404);
  return data;
};

const getRankingBonuses = async () => {
  const data = await ranking.findAll();
  return data;
};

const updateRankingBonus = async (data, rankingId) => {
  const oldData = await ranking.findByPk(rankingId);
  if (!oldData) throw new ResponseError("Data not found", 404);

  return withTransaction(async (transaction) => {
    const rankingUpdated = await rankingRepository.updateBonusRankingById(
      rankingId,
      data,
      {
        transaction,
      }
    );

    // Log Audit
    const dataAudit = {
      event: "Update bonus level",
      model_id: rankingId,
      model_name: ranking.tableName,
      old_values: oldData,
      new_values: rankingUpdated,
    };

    await auditService.store(dataAudit, transaction);
  });
};

const getRankingBonusById = async (rankingId) => {
  const data = await rankingRepository.getDataById(rankingId);
  if (!data) throw new ResponseError("Data not found", 404);
  return data;
};

module.exports = {
  getRangkings,
  updateRanking,
  getRangkingById,
  getRankingBonuses,
  updateRankingBonus,
  getRankingBonusById,
  createRankingWithRequirement,
  deleteRankingWithRequirement,
};
