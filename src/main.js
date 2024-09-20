const express = require("express");
const db = require("./config/database.js");
const logger = require("./config/logging.js");
const routes = require("./routes/index");

require("dotenv").config();

const app = express();
const port = process.env.APP_PORT;
const path = require("path");
const errorHandler = require("./middleware/error-handler.js");
const Response = require("./utils/response-handler.js");
const { parseEnv } = require("./utils/env.js");

app.use(errorHandler);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* Handling application/x-www-form-urlencoded */
app.use(express.urlencoded({ extended: false }));

app.use("/api", routes);
app.use((req, res, next) => Response.NotFound(res));

// app.use(cookieParser());

// Sync models before starting the server
async function startServer() {
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");

    await db.sync({ force: false }); // Change to { force: true } if needed
    // console.log("Models synchronized successfully!");
    logger.info("Models synchronized successfully!");

    app.listen(port, () => {
      console.log(`Server starting from port: ${port}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    console.error("Unable to sync models:", error);
  }
}

startServer();
