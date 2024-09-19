const { default: SequelizeAuto } = require("sequelize-auto");
const config = require("../config/config.json");

const auto = new SequelizeAuto(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    port: config.development.port, // Port for PostgreSQL
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
    console.error(err);
  });
