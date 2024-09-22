const db = require("../config/database.js");
const { Sequelize, where } = require("sequelize");
const helper = require("../utils/helper.js");

require("../models/reff_user_status")(db, Sequelize.DataTypes);
require("../models/reff_ranking_req_type.js")(db, Sequelize.DataTypes);

const getAllData = async (modelName) => {
  const Model = db.models[modelName];
  const data = await Model.findAll();
  return data;
};

const getDataById = async (id, modelName) => {
  const Model = db.models[modelName];
  const data = await Model.findOne({
    where: {
      id: id,
    },
  });
  return data;
};

const store = async (data, modelName, refName) => {
  const objData = generateObjectData(data, refName);

  console.log(objData);

  const Model = db.models[modelName];
  await Model.create(objData);
};

const generateObjectData = (data, refName) => {
  if (refName == "ranking-req") {
    return {
      id: helper.toSnakeCase(data.ranking_req_type_nm),
      ...data,
    };
  }

  return data;
};

module.exports = {
  getAllData,
  getDataById,
  store,
};
