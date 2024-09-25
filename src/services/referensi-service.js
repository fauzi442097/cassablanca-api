const db = require("../config/database.js");
const helper = require("../utils/helper.js");

const initModels = require("../models/init-models");
const models = initModels(db);

const auditService = require("../services/audit-service.js");
const ResponseError = require("../utils/response-error.js");

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
      event: `Tambah referensi ${refTitle}`,
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
  if (!dataExisting) throw new ResponseError("Data tidak ditemukan", 404);

  return helper.withTransaction(async (transaction) => {
    const dataUpdated = await Model.update(formData, {
      where: { id: id },
      returning: true,
      transaction,
    });

    const AuditDTO = {
      event: `Ubah referensi ${refTitle}`,
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
  if (!dataExisting) throw new ResponseError("Data tidak ditemukan", 404);

  return helper.withTransaction(async (transaction) => {
    await Model.destroy({
      where: { id: id },
      returning: true,
      transaction,
    });

    const AuditDTO = {
      event: `Hapus referensi ${refTitle}`,
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
      formData = { id: helper.toSnakeCase(data.id).toUpperCase() };
      break;
    case "chain":
      formData = { id: helper.toSnakeCase(data.id), ...data };
      break;
    default:
      formData = data;
  }

  return formData;
};

module.exports = {
  getAllData,
  getDataById,
  store,
  update,
  deleteById,
};
