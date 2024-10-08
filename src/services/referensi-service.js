const db = require("../config/database.js");
const helper = require("../utils/helper.js");

const initModels = require("../models/init-models");
const models = initModels(db);

const auditService = require("../services/audit-service.js");
const ResponseError = require("../utils/response-error.js");

const fileService = require("../services/file-service.js");

const getAllData = async (modelName) => {
  const Model = models[modelName];
  const data = await Model.findAll();
  return data;
};

const getDataById = async (id, modelName) => {
  const Model = models[modelName];
  const data = await Model.findOne({
    where: {
      id: id,
    },
  });

  if (modelName == "reff_curr") {
    return {
      ...data.dataValues,
      currency_name: data.id,
    };
  }

  return data;
};

const store = async (data, modelName, refName) => {
  const Model = models[modelName];
  const formData = await generateObjectData(data, refName, Model);
  const refTitle = helper.getRefTitle(refName);

  return helper.withTransaction(async (transaction) => {
    const dataCreated = await Model.create(formData, {
      returning: true,
      transaction,
    });

    const AuditDTO = {
      event: `Create referensi ${refTitle}`,
      model_id: dataCreated.id,
      model_name: Model.tableName,
      new_values: dataCreated,
    };
    await auditService.store(AuditDTO, transaction);
  });
};

const update = async (id, data, modelName, refName) => {
  const Model = models[modelName];

  const formData = await generateObjectData(data, refName, Model, id);
  const refTitle = helper.getRefTitle(refName);

  const dataExisting = await Model.findByPk(id);
  if (!dataExisting) throw new ResponseError("Data not found", 404);

  return helper.withTransaction(async (transaction) => {
    const dataUpdated = await Model.update(formData, {
      where: { id: id },
      returning: true,
      transaction,
    });

    const AuditDTO = {
      event: `Update referensi ${refTitle}`,
      model_id: id,
      model_name: Model.tableName,
      old_values: dataExisting,
      new_values: dataUpdated,
    };
    await auditService.store(AuditDTO, transaction);
  });
};

const deleteById = async (id, modelName, refName) => {
  const Model = models[modelName];
  const refTitle = helper.getRefTitle(refName);

  const dataExisting = await Model.findByPk(id);
  if (!dataExisting) throw new ResponseError("Data not found", 404);

  return helper.withTransaction(async (transaction) => {
    await Model.destroy({
      where: { id: id },
      returning: true,
      transaction,
    });

    const AuditDTO = {
      event: `Delete referensi ${refTitle}`,
      model_id: id,
      model_name: Model.tableName,
      old_values: dataExisting,
    };
    await auditService.store(AuditDTO, transaction);
  });
};

const generateObjectData = async (data, refName, model, id = null) => {
  let formData;

  switch (refName) {
    case "ranking-req":
      id = helper.toSnakeCase(data.ranking_req_type_nm);
      formData = { id, ...data };
      break;
    case "user-status":
      id = id || (await helper.getNextId(model));
      formData = { id, ...data };
      break;
    case "wallet-type":
      id = helper.toSnakeCase(data.wallet_type_nm);
      formData = { id, ...data };
      break;
    case "withdrawal-status":
      id = helper.toSnakeCase(data.withdrawal_status_nm);
      formData = { id, ...data };
      break;
    case "bonus-status":
      id = helper.toSnakeCase(data.bonus_status_nm);
      formData = { id, ...data };
      break;
    case "currency":
      formData = {
        id: helper.toSnakeCase(data.currency_name).toUpperCase(),
        min_withdrawal: data.min_withdrawal,
      };
      break;
    case "chain": {
      let pathFile = null;

      if (id) {
        const oldData = await model.findOne({
          where: {
            id: id,
          },
        });

        pathFile = oldData.logo;
        if (data.logo && oldData.logo) {
          await fileService.checkAndRemoveFile(oldData.logo);
        }
      }

      if (data.logo) {
        pathFile = await fileService.saveFileBase64(
          data.logo.content,
          data.logo.filename,
          "img"
        );
      }

      formData = {
        id: helper.toSnakeCase(data.chain_nm),
        chain_nm: data.chain_nm,
        confirm_cnt: data.confirm_cnt,
        logo: pathFile,
      };
      break;
    }
    default:
      formData = data;
  }

  return formData;
};

const getMinimumWithdrawal = async (type) => {
  return await models.reff_curr.findOne({
    where: {
      id: type,
    },
  });
};

module.exports = {
  getAllData,
  getDataById,
  store,
  update,
  deleteById,
  getMinimumWithdrawal,
};
