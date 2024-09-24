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
  return data;
};

const updateRanking = async (rankingId, data) => {
  const dataRanking = await rankingRepository.getDataById(rankingId);
  if (!dataRanking) throw new ResponseError("Data tidak ditemukan", 404);

  return withTransaction(async (transaction) => {
    const newDataRanking = await rankingRepository.updateRanking(
      rankingId,
      data,
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

    let newRankingReq;
    let auditReqRanking;

    for (const item of data.levelRequirement) {
      const oldRankingReq =
        await rankingReqRepository.getDataByRankingIdAndReqType(
          rankingId,
          item.id
        );

      if (oldRankingReq) {
        // UPDATE EXISTING REQUIREMENT
        newRankingReq = await rankingReqRepository.updateByRankingIdAndReqType(
          rankingId,
          item,
          transaction
        );

        // Log Audit
        auditReqRanking = {
          event: `Update persyaratan untuk level ${dataRanking.ranking_nm}`,
          model_id: dataRanking.id,
          model_name: ranking_req.tableName,
          old_values: oldRankingReq,
          new_values: newRankingReq,
        };
      } else {
        // INSERT NEW REQUIREMENT
        let newRankingReq = {
          ranking_id: rankingId,
          ranking_req_type_id: item.id,
          ranking_id_member: item.levelId,
          value: item.value,
        };

        newRankingReq = await rankingReqRepository.store(
          newRankingReq,
          transaction
        );

        auditReqRanking = {
          event: `Tambah persyaratan untuk level ${dataRanking.ranking_nm}`,
          model_id: newRankingReq.id,
          model_name: ranking_req.tableName,
          new_values: newRankingReq,
        };
      }

      await auditService.store(auditReqRanking, transaction);
    }
  });
};

const createRankingWithRequirement = async (data) => {
  const maxLevel = await ranking.max("lvl");
  const newLevel = (maxLevel || 0) + 1; // If maxLevel is null, start from 0
  data = {
    ...data,
    id: toSnakeCase(data.levelName),
    lvl: newLevel,
  };

  return withTransaction(async (transaction) => {
    // Calculate the new level
    const rankingCreated = await rankingRepository.store(data, transaction);

    // Log Audit
    let dataAuditRanking = {
      event: "Tambah level",
      model_id: rankingCreated.id,
      model_name: ranking.tableName,
      new_values: rankingCreated,
    };
    dataAuditRanking = { ...dataAuditRanking };
    await auditService.store(dataAuditRanking, transaction);

    for (const item of data.levelRequirement) {
      const dataRankingReq = {
        ranking_id: rankingCreated.id,
        ranking_req_type_id: item.id,
        ranking_id_member: item.levelId,
        value: item.value,
      };

      const rankingReqCreated = await rankingReqRepository.store(
        dataRankingReq,
        transaction
      );

      let auditReqRanking = {
        event: `Tambah persyaratan untuk level ${data.levelName}`,
        model_id: rankingReqCreated.id,
        model_name: ranking_req.tableName,
        new_values: rankingReqCreated,
      };
      await auditService.store(auditReqRanking, transaction);
    }
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

  if (!data) throw new ResponseError("Data tidak ditemukan", 404);
  return data;
};

const getRankingBonuses = async () => {
  const data = await ranking.findAll();
  return data;
};

const updateRankingBonus = async (data, rankingId) => {
  const oldData = await ranking.findByPk(rankingId);
  if (!oldData) throw new ResponseError("Data tidak ditemukan", 404);

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
      event: "Update bonus peringkat",
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
  if (!data) throw new ResponseError("Data tidak ditemukan", 404);
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
};
