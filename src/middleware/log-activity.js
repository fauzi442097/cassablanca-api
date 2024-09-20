const logger = require("../config/logging");

const logActivities = (req, res, next) => {
  const startTime = Date.now();
  const requestBody = req.body;
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
};

module.exports = logActivities;
