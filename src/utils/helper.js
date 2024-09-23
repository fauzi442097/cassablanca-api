const db = require("../config/database");
const { asyncLocalStorage } = require("../middleware/log-activity");

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

const withTransaction = async (callback) => {
  const transaction = await db.transaction();
  try {
    const result = await callback(transaction);
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

const getRequestObject = () => {
  return asyncLocalStorage.getStore().get("req");
};

const generateReferralCode = (length = 8) => {
  // Define the characters to use in the referral code
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let referralCode = "";

  // Generate the code with the specified length
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters[randomIndex];
  }

  return referralCode;
};

module.exports = {
  generateOtp,
  tryCatch,
  withTransaction,
  isNullOrUndefined,
  toSnakeCase,
  getRequestObject,
  generateReferralCode,
};
