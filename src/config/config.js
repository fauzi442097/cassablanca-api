require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  },
  test: {
    username: "postgres",
    password: null,
    port: 5432,
    database: "bsmr_local",
    host: "127.0.0.1",
    dialect: "postgres",
  },
  production: {
    username: "postgres",
    password: null,
    port: 5432,
    database: "bsmr_local",
    host: "127.0.0.1",
    dialect: "postgres",
  },
};
