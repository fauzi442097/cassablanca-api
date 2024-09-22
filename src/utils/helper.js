const db = require("../config/database");

const generateOtp = (length = 6) => {
  let otp = "";
  const digits = "0123456789";

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }

  return otp;
};

const tryCatch = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error); // Pass the error to Express error handler middleware
  }
};

const transactionWrapper = async (transactionalFunction) => {
  const transaction = await db.transaction();
  try {
    const result = await transactionalFunction(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const isNullOrUndefined = (value) => {
  return value === null || value === undefined;
};

const toSnakeCase = (str) => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2") // Insert underscore between camelCase words
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/-+/g, "_") // Replace dashes with underscores
    .toLowerCase(); // Convert the entire string to lowercase
};

module.exports = {
  generateOtp,
  tryCatch,
  transactionWrapper,
  isNullOrUndefined,
  toSnakeCase,
};
