const userRepository = require("../repositories/user-repository");
const ResponseError = require("../utils/response-error");
const fileService = require("../services/file-service");
const auditService = require("../services/audit-service");

const { withTransaction } = require("../utils/helper");
const initModels = require("../models/init-models");
const db = require("../config/database");

const { users } = initModels(db);

const getProfile = async (userId, req) => {
  const user = await userRepository.getDataById(userId, {
    attributes: {
      exclude: [
        "password",
        "wrong_password_cnt",
        "private_key",
        "otp",
        "expired_otp",
        "username",
      ],
    },
  });

  return user;
};

const updateProfile = async (data, userLoginId) => {
  const anotherUserEmail = await userRepository.getEmailAnotherUser(
    userLoginId,
    data.email
  );

  if (anotherUserEmail)
    throw new ResponseError(
      "This email address is already registered. Please enter a different email address",
      400
    );

  const updateProfileDTO = {
    email: data.email,
    fullname: data.fullname,
  };

  const currentData = await userRepository.getDataById(userLoginId);

  if (data.photo_url && currentData.photo_url) {
    await fileService.checkAndRemoveFile(currentData.photo_url);
  }

  if (data.photo_url) {
    const pathFile = await fileService.saveFileBase64(
      data.photo_url.content,
      data.photo_url.filename,
      "img"
    );
    updateProfileDTO.photo_url = pathFile;
  }

  return withTransaction(async (transaction) => {
    const profileUpdated = await userRepository.updateProfile(
      userLoginId,
      updateProfileDTO,
      transaction
    );

    // Log Audit
    let dataAudit = {
      user_id: userLoginId,
      event: "Update profile",
      model_id: currentData.id,
      model_name: users.tableName,
      old_values: currentData,
      new_values: profileUpdated,
    };

    await auditService.store(dataAudit);
  });
};

module.exports = {
  getProfile,
  updateProfile,
};
