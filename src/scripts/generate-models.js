const { default: SequelizeAuto } = require("sequelize-auto");
const config = require("../config/config-env.js");
require("dotenv").config();

const env = process.env.NODE_ENV || "development";

const auto = new SequelizeAuto(
  config[env].database,
  config[env].username,
  config[env].password,
  {
    host: config[env].host,
    port: config[env].port,
    dialect: "postgres",
    directory: "./src/models", // Directory where models will be generated
    namespace: "models", // Optional: set a namespace for the models
  }
);

// Generate the models
auto
  .run()
  .then((data) => {
    console.log(data.tables); // Log generated tables
  })
  .catch((err) => {
    console.log("tes");
    console.error(err);
  });
