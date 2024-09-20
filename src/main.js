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

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* Handling application/x-www-form-urlencoded */
app.use(express.urlencoded({ extended: false }));

// Middleware to log each request (activity)
app.use((req, res, next) => {
  const startTime = Date.now();
  const requestBody = req.body; // Data tubuh permintaan
  const userAgent = req.headers["user-agent"];

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    let bodyLogger = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${duration}ms`,
      userAgent: userAgent,
      requestBody: requestBody,
    };
    logger.info(bodyLogger);
  });

  next();
});

app.use("/api", routes);
app.use((req, res, next) => Response.NotFound(res));

// Middleware Global error handler
app.use(errorHandler);

// app.use(cookieParser());

// Sync models before starting the server
async function startServer() {
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");

    await db.sync({ force: false }); // Change to { force: true } if needed
    // console.log("Models synchronized successfully!");
    // logger.info("Models synchronized successfully!");

    app.listen(port, () => {
      console.log(`Server starting from port: ${port}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    console.error("Unable to sync models:", error);
  }
}

startServer();
