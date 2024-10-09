const transporter = require("../config/mail");
const {
  generateOtp,
  withTransaction,
  generateReferralCode,
} = require("../utils/helper");
const jwt = require("jsonwebtoken");
const ResponseError = require("../utils/response-error");
const db = require("../config/database");
const initModels = require("../models/init-models");
const { users, member, ranking } = initModels(db);
const auditService = require("../services/audit-service");
const walletService = require("../services/wallet-service");

const userRepository = require("../repositories/user-repository");
const memberRepository = require("../repositories/member-repository");
const userBallanceRepository = require("../repositories/user-ballance-repository");

const { ROLE, STATUS_USER } = require("../utils/ref-value");

const requestOTPService = async (email) => {
  const user = await userRepository.getDataByEmail(email);
  if (!user)
    throw new ResponseError(
      "This email address is not registered. Please check and try again",
      401
    );

  if (user.user_status_id == STATUS_USER.BLOCKED)
    throw new ResponseError(
      "Your account has been blocked. Please contact admin",
      403
    );

  const otp = generateOtp();

  // send mail with defined transport object
  await sendEmailOTP(otp, email, user.fullname);

  // Send the OTP email with sender email
  //   await sendOtpEmail(email, otp);

  const currentDate = new Date(); // Current date and time
  const expiredOTP = new Date(currentDate.getTime() + 15 * 60000);

  // Log Audit
  const dataAudit = {
    user_id: user.id,
    event: "Request OTP",
    model_id: user.id,
    model_name: users.tableName,
    old_values: user,
  };

  return withTransaction(async (transaction) => {
    // Update OTP to user
    await userRepository.updateOTPByUserId(user.id, otp, expiredOTP, {
      transaction,
    });

    await auditService.store(dataAudit, transaction);
  });
};

const verifyOTPService = async (otp) => {
  const user = await userRepository.getDataByOTP(otp);
  if (!user)
    throw new ResponseError(
      "Invalid OTP. Please check the code and enter it again.",
      401
    );

  const currentData = new Date();
  if (currentData > user.expired_otp) {
    throw new ResponseError(
      "OTP has expired. Please request a new code to continue",
      401
    );
  }

  if (!currentData.email_verified) {
    await userRepository.setVerified(user.id);
  }

  const dataMember = await memberRepository.getDataById(user.id, {
    include: [
      {
        model: ranking,
        as: "ranking",
      },
    ],
  });

  let rankingName = null;
  if (dataMember) {
    rankingName = dataMember.ranking ? dataMember.ranking.ranking_nm : null;
  }

  const payload = {
    email: user.email,
    id: user.id,
    full_name: user.fullname,
    role_id: user.role_id,
    ranking: rankingName,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h", // 1 Hour
  });

  // Log Audit
  const dataAudit = {
    user_id: user.id,
    event: "Login",
    model_id: user.id,
    model_name: users.tableName,
    old_values: user,
  };
  await auditService.store(dataAudit);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.fullname,
      role_id: user.role_id,
      ranking: rankingName,
    },
  };
};

const registerMemberByReferalCode = async (data) => {
  const memberByEmail = await memberRepository.getDataByEmail(data.email);
  if (memberByEmail)
    throw new ResponseError(
      "This email address is already registered. Please enter a different email address",
      400
    );

  const memberByRefCode = await memberRepository.getDataByReferalCode(
    data.referal_code
  );
  if (!memberByRefCode)
    throw new ResponseError(
      "The referral code is invalid. Please check and try again",
      400
    );

  const referralCode = generateReferralCode();

  const otp = generateOtp();
  const currentDate = new Date();
  const expiredOTP = new Date(currentDate.getTime() + 15 * 60000); // 15 menit

  const newMemberData = {
    email: data.email,
    fullname: data.full_name,
    role_id: ROLE.MEMBER,
    referal_code: referralCode,
    member_id_parent: memberByRefCode.id,
    user_status_id: STATUS_USER.INACTIVE,
    otp: otp,
    expired_otp: expiredOTP,
  };

  return withTransaction(async (transaction) => {
    await sendEmailOTP(otp, data.email, data.full_name);

    const newMember = await memberRepository.store(newMemberData, transaction);
    await userBallanceRepository.createInitialBallanceMember(newMember.id);

    // Log Audit
    let dataAudit = {
      user_id: newMember.id,
      event: "Register member with referral code",
      model_id: newMember.id,
      model_name: member.tableName,
      new_values: newMember,
    };

    await auditService.store(dataAudit);
  });
};

const sendEmailOTP = async (otp, email, fullname) => {
  await transporter.sendMail({
    from: "Anonymous <jayden.gibson29@ethereal.email>", // sender address
    to: email, // list of receivers
    subject: "Your OTP Code for Secure Login", // Subject line
    html: `<p> Halo ${fullname}, </p>
       <p> We received a request to log in to your account. To continue, please enter the following OTP code: </p>
      <p> OTP Code: </p>
      <span style="display: inline-block; background: #000; padding: 4px; font-size: 1.2rem; color: #fff;"> ${otp} </span> <br/>
      <p> This code is valid for the next <b> 15 minutes </b>. Please do not share this code with anyone. </p>
      <p> If you did not request this code, please ignore this email</p>
      <p>Best regards</p>
      <p>Admin</p>
      `,
  });
};

const getCurrentUserLogin = async (userId) => {
  const user = await userRepository.getDataById(userId);
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullname,
    role_id: user.role_id,
  };
};

module.exports = {
  requestOTPService,
  verifyOTPService,
  registerMemberByReferalCode,
  getCurrentUserLogin,
};
