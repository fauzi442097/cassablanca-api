const express = require("express");
const logger = require("./config/logging.js");
const routes = require("./routes/index");
const cors = require("cors");
const app = express();
const path = require("path");
const errorHandler = require("./middleware/error-handler.js");
const Response = require("./utils/response-handler.js");
const cookieParser = require("cookie-parser");
const { parseEnvNumber } = require("./utils/env.js");
const authenticateJWT = require("./middleware/authenticate.js");
const logActivities = require("./middleware/log-activity.js");

require("dotenv").config();

const corsOptions = {
  origin: ["http://localhost:3000", "::1", "http://127.0.0.1:5500"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  // allowedHeaders: ["Content-Type", "Authorization"],
  // exposedHeaders: ["Custom-Header"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

/* Handling application/x-www-form-urlencoded */
app.use(express.urlencoded({ extended: false }));

// Middleware to log each request (activity)
app.use(logActivities);

// Apply JWT authentication middleware to all routes except login and register
app.use(authenticateJWT);

app.use("/api", routes);
app.use((req, res, next) => Response.NotFound(res));

// Middleware Global error handler
app.use(errorHandler);

const port = parseEnvNumber("APP_PORT", 3000);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
