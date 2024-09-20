const winston = require("winston");
require("winston-daily-rotate-file");

const logger = winston.createLogger({
  level: "info",
  exitOnError: false, // exit when error
  format: winston.format.combine(
    winston.format.timestamp({
      format: "DD-MM-YYYY hh:mm:ss",
    }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `[${level.toUpperCase()} - ${timestamp}]: ${message} \n ${stack}`;
    })
    // winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      level: "warn",
      format: winston.format.combine(
        winston.format.colorize() // Menambahkan warna pada log untuk console
      ),
    }),
    new winston.transports.DailyRotateFile({
      level: "error",
      rejectionHandlers: true,
      dirname: "./src/logs/errors",
      filename: "error-%DATE%.log",
      datePattern: "DD-MM-YYYY",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      format: winston.format.combine(
        winston.format.timestamp({
          format: "DD-MM-YYYY hh:mm:ss", // 2022-01-25 03:23:10.350 PM=
        }),
        winston.format.json(),
        winston.format.printf(
          ({ timestamp, level, message, statusCode, method, url, stack }) => {
            return `${JSON.stringify({
              timestamp: timestamp,
              level: level.toUpperCase(),
              message: message,
              statusCode,
              method,
              url,
              stack,
            })}`;
          }
        )
      ),
    }),
    new winston.transports.DailyRotateFile({
      level: "info",
      dirname: "./src/logs/activities",
      filename: "activity-%DATE%.log",
      datePattern: "DD-MM-YYYY",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      format: winston.format.combine(
        winston.format.timestamp({
          format: "DD-MM-YYYY hh:mm:ss", // 2022-01-25 03:23:10.350 PM=
        }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${JSON.stringify({
            timestamp: timestamp,
            level: level.toUpperCase(),
            method: message.method,
            url: message.url,
            ...message,
          })}`;
        })
      ),
    }),
  ],
});

module.exports = logger;
