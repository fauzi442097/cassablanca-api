const db = require("../config/database");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
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

module.exports = {
  generateOtp,
  tryCatch,
  transactionWrapper,
  isNullOrUndefined,
};
