require("dotenv").config();
const { Sequelize } = require("sequelize");
const logger = require("./logging");
const config = require("../config/config.json");

const db = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    port: config.development.port,
    dialect: "postgres",
    logging: (msg) => logger.info(msg), // Use Winston to log Sequelize messages
  }
);

module.exports = db;
