const db = require("../config/database.js");
const { Sequelize } = require("sequelize");

const Person = require("../models/person.js")(db, Sequelize.DataTypes);

const getPersons = async () => {
  const data = await Person.findAll();
  return data;
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
