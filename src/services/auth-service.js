const { generateOtp } = require("../utils/helper");
const jwt = require("jsonwebtoken");

const loginService = async (email) => {
  const otp = generateOtp();

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    // expiresIn: "1h",
    expiresIn: "1m",
  });

  // Send the OTP email
  //   await sendOtpEmail(email, otp);

  return { otp, token };
};

module.exports = {
  loginService,
};
