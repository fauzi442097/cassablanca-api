const logger = require("../config/logging");
const { AsyncLocalStorage } = require("async_hooks");

const asyncLocalStorage = new AsyncLocalStorage();

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

  asyncLocalStorage.run(new Map(), () => {
    asyncLocalStorage.getStore().set("req", req); // set request object to global state
    next();
  });
};

module.exports = {
  logActivities,
  asyncLocalStorage,
};
