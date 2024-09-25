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
  const { formData, refTitle } = await generateObjectData(data, refName, Model);

  return helper.withTransaction(async (transaction) => {
    const dataCreated = await Model.create(formData, {
      returning: true,
      transaction,
    });

    const AuditDTO = {
      event: `Tambah data referensi ${refTitle}`,
      model_id: dataCreated.id,
      model_name: Model.tableName,
      new_values: dataCreated,
    };
    await auditService.store(AuditDTO, transaction);
  });
};

const update = async (id, data, modelName, refName) => {
  const Model = models[modelName];
  const { formData, refTitle } = await generateObjectData(
    data,
    refName,
    Model,
    id
  );

  const dataExisting = await Model.findByPk(id);
  if (!dataExisting) throw new ResponseError("Data tidak ditemukan", 404);

  return helper.withTransaction(async (transaction) => {
    const dataUpdated = await Model.update(formData, {
      where: { id: id },
      returning: true,
      transaction,
    });

    const AuditDTO = {
      event: `Ubah data referensi ${refTitle}`,
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

  const dataExisting = await Model.findByPk(id);
  if (!dataExisting) throw new ResponseError("Data tidak ditemukan", 404);

  return helper.withTransaction(async (transaction) => {
    await Model.destroy({
      where: { id: id },
      returning: true,
      transaction,
    });

    const AuditDTO = {
      event: `Hapus data referensi ${refName}`,
      model_id: id,
      model_name: Model.tableName,
      old_values: dataExisting,
    };
    await auditService.store(AuditDTO, transaction);
  });
};

const generateObjectData = async (data, refName, model, id = null) => {
  let formData;
  let refTitle;

  switch (refName) {
    case "ranking-req":
      id = helper.toSnakeCase(data.ranking_req_type_nm);
      formData = { id, ...data };
      refTitle = "'Ranking Requirement'";
      break;
    case "user-status":
      refTitle = "'User Status'";
      id = await helper.getNextId(model);
      formData = { id, ...data };
      break;
    case "wallet-type":
      id = helper.toSnakeCase(data.wallet_type_nm);
      formData = { id, ...data };
      refTitle = "'Wallet Type'";
      break;
    case "withdrawal-status":
      id = helper.toSnakeCase(data.withdrawal_status_nm);
      formData = { id, ...data };
      refTitle = "'Withdrawal Status'";
      break;
    case "bonus-status":
      id = helper.toSnakeCase(data.bonus_status_nm);
      formData = { id, ...data };
      refTitle = "'Bonus Status'";
      break;
    case "currency":
      formData = { id: helper.toSnakeCase(data.id).toUpperCase() };
      refTitle = "'Currency'";
      break;
    case "chain":
      formData = { id: helper.toSnakeCase(data.id), ...data };
      refTitle = "'Chain'";
      break;
    default:
      formData = data;
  }

  return { formData, refTitle };
};

module.exports = {
  getAllData,
  getDataById,
  store,
  update,
  deleteById,
};
