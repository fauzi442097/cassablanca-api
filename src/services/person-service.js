const db = require("../config/database.js");
const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");

const Person = require("../models/person.js")(db, Sequelize.DataTypes);

const getPersons = async (page, size, search) => {
  const offset = (page - 1) * size;

  const whereCondition = search
    ? {
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      }
    : {};

  const result = await Person.findAndCountAll({
    where: whereCondition,
    limit: size,
    offset: offset,
  });

  const dataPagination = {
    items: result.rows,
    pagination: {
      total_records: result.count,
      total_pages: Math.ceil(result.count / size),
      current_page: page,
    },
  };

  return dataPagination;
};

const getPersonById = async (personId) => {
  const data = await Person.findAll({
    where: {
      id: personId,
    },
  });
  return data;
};

module.exports = {
  getPersons,
  getPersonById,
};
