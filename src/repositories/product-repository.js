const db = require("../config/database");
const initModels = require("../models/init-models");

const { product } = initModels(db);

const getAll = async () => {
  const data = await product.findAll({
    order: [['id', 'DESC']],
  });
  return data;
};

const getDataById = async (productId) => {
  const data = await product.findByPk(productId);
  return data;
};

const store = async (data, transaction) => {
  return await product.create(data, {
    returning: true,
    transaction,
  });
};

const update = async (productId, data, transaction) => {
  return await product.update(data, {
    where: {
      id: productId,
    },
    returning: true,
    transaction,
  });
};

const deleteById = async (productId, transaction) => {
  return await product.destroy({
    where: {
      id: productId,
    },
    returning: true,
    transaction,
  });
};

const getDataByCurrId = async (currId) => {
  const data = await product.findOne({ where: { curr_id: currId } });
  return data;
};

module.exports = {
  getAll,
  getDataById,
  store,
  deleteById,
  update,
  getDataByCurrId,
};
