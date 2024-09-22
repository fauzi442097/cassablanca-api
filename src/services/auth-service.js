const transporter = require("../config/mail");
const { generateOtp } = require("../utils/helper");
const jwt = require("jsonwebtoken");
const ResponseError = require("../utils/response-error");
const { Sequelize } = require("sequelize");
const db = require("../config/database");

const UserModel = require("../models/users")(db, Sequelize.DataTypes);

const requestOTPService = async (email) => {
  const user = await UserModel.findOne({
    attributes: ["id", "email", "fullname"],
    where: {
      email: email,
    },
  });

  if (!user) throw new ResponseError("Email tidak terdaftar dalam sistem", 401);

  const otp = generateOtp();

  // send mail with defined transport object
  await sendEmailOTP(otp, email);

  const currentDate = new Date(); // Current date and time
  const newDate = new Date(currentDate.getTime() + 15 * 60000);

  // Update OTP to user
  await UserModel.update(
    {
      otp: otp,
      expired_otp: newDate,
    },
    {
      where: {
        id: user.id,
      },
    }
  );

  // Send the OTP email
  //   await sendOtpEmail(email, otp);
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

const verifyOTPService = async (email, otp) => {
  const user = await UserModel.findOne({
    where: {
      email: email,
    },
  });

  console.log(user.expired_otp);

  if (!user || user.otp != otp)
    throw new ResponseError("Email atau OTP salah", 401);

  const currentData = new Date();
  if (currentData > user.expired_otp) {
    throw new ResponseError("OTP Expired", 401);
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h", // 1 Hour
  });

  return token;
};

module.exports = {
  requestOTPService,
  verifyOTPService,
};
