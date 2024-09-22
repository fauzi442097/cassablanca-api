const { Sequelize } = require("sequelize");
require("dotenv").config();

// Environment variables
const database = process.env.DB_DATABASE || "postgres";
const username = process.env.DB_USERNAME || "postgres";
const password = process.env.DB_PASSWORD || "postgres";
const host = process.env.DB_HOST || "localhost";
const port = process.env.DB_PORT || 5432;

const db = new Sequelize(database, username, password, {
  host: host,
  port: port,
  dialect: "postgres",
  timezone: "Asia/Jakarta",
  // logging: (msg) => logger.info(msg), // Use Winston to log Sequelize messages
});

module.exports = db;
