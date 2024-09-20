const { Sequelize } = require("sequelize");
const logger = require("./logging");
const config = require("./config");

const env = process.env.NODE_ENV || "development";

const db = new Sequelize(
  config[env].database,
  config[env].username,
  config[env].password,
  {
    host: config[env].host,
    port: config[env].port,
    dialect: "postgres",
    // logging: (msg) => logger.info(msg), // Use Winston to log Sequelize messages
  }
);

module.exports = db;
