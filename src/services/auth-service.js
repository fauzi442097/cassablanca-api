const transporter = require("../config/mail");
const { generateOtp, withTransaction } = require("../utils/helper");
const jwt = require("jsonwebtoken");
const ResponseError = require("../utils/response-error");
const db = require("../config/database");
const initModels = require("../models/init-models");
const { users } = initModels(db);
const auditService = require("../services/audit-service");

const userRepository = require("../repositories/user-repository");

const requestOTPService = async (email) => {
  const user = await userRepository.getDataByEmail(email);
  if (!user) throw new ResponseError("Email tidak terdaftar dalam sistem", 401);

  const otp = generateOtp();

  // send mail with defined transport object
  await sendEmailOTP(otp, email);

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

const verifyOTPService = async (email, otp) => {
  const user = await userRepository.getDataByEmail(email);
  if (!user || user.otp != otp)
    throw new ResponseError("Email atau OTP salah", 401);

  const currentData = new Date();
  if (currentData > user.expired_otp) {
    throw new ResponseError("OTP Expired", 401);
  }

  const token = jwt.sign(
    { email, id: user.id, full_name: user.fullname },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h", // 1 Hour
    }
  );

  // Log Audit
  const dataAudit = {
    user_id: user.id,
    event: "Login",
    model_id: user.id,
    model_name: users.tableName,
    old_values: user,
  };
  await auditService.store(dataAudit);

  return token;
};

const sendEmailOTP = async (otp, email) => {
  await transporter.sendMail({
    from: "Anonymous <jayden.gibson29@ethereal.email>", // sender address
    to: email, // list of receivers
    subject: "Kode OTP untuk Verifikasi Login Anda", // Subject line
    html: `<p> Halo Fauzi, </p>
       <p> Kami menerima permintaan untuk login ke akun Anda. Untuk melanjutkan, silakan masukkan kode OTP berikut: </p>
      <p> Kode OTP: </p>
      <span style="display: inline-block; background: #ccc; padding: 4px; font-size: 1.2rem; color: #fff;"> ${otp} </span> <br/>
      <p> Kode ini berlaku selama <b> 15 menit </b>. Mohon jangan bagikan kode ini kepada siapa pun. </p>
      <p> Jika Anda tidak melakukan permintaan ini, silakan abaikan email ini.</p>
      <p>Terima kasih</p>,`, // html body
  });
};

module.exports = {
  requestOTPService,
  verifyOTPService,
};
