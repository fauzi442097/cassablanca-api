const { parseEnv, parseEnvNumber } = require("../utils/env");
require("dotenv").config();

const configEnv = {
  development: {
    username: parseEnv("DB_USERNAME", "postgres"),
    password: parseEnv("DB_PASSWORD", "postgres"),
    port: parseEnvNumber("DB_PORT", 5432),
    database: parseEnv("DB_DATABASE", "postgres"),
    host: parseEnv("DB_HOST", "127.0.0.1"),
    dialect: parseEnv("DB_DIALECT", "postgres"),
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

module.exports = configEnv;
