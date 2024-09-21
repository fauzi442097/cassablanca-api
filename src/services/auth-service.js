const transporter = require("../config/mail");
const { generateOtp } = require("../utils/helper");
const jwt = require("jsonwebtoken");
const ResponseError = require("../utils/response-error");

// In-memory store for OTPs (Use database in production)
let otpStore = {};

const requestOTPService = async (email) => {
  const otp = generateOtp();

  otpStore[email] = otp; // store otp in memory

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: "Anonymous <jayden.gibson29@ethereal.email>", // sender address
    to: email, // list of receivers
    subject: "Kode OTP untuk Verifikasi Login Anda", // Subject line
    html: `<p> Halo Fauzi, </p>
       <p> Kami menerima permintaan untuk login ke akun Anda. Untuk melanjutkan, silakan masukkan kode OTP berikut: </p>
      <p> Kode OTP: </p>
      <span style="display: inline-block; background: #ccc; padding: 4px; font-size: 1.2rem; color: #fff;"> ${otp} </span> <br/>
      <p> Kode ini berlaku selama <b> 5 menit </b>. Mohon jangan bagikan kode ini kepada siapa pun. </p>
      <p> Jika Anda tidak melakukan permintaan ini, silakan abaikan email ini.</p>
      <p>Terima kasih</p>,`, // html body
  });

  console.log("Message sent: %s", info.messageId);

  // Send the OTP email
  //   await sendOtpEmail(email, otp);
};

const verifyOTPService = async (email, otp) => {
  if (!otpStore[email] || !otpStore[email] === otp) {
    throw new ResponseError("Invalid OTP", 400);
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h", // 1 Hour
  });

  // Remove OTP after verification (to prevent reuse)
  // delete otpStore[email];

  return token;
};

module.exports = {
  requestOTPService,
  verifyOTPService,
};
