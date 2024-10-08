const db = require("../config/database");
const transporter = require("../config/mail");
const { asyncLocalStorage } = require("../middleware/log-activity");
const jwt = require("jsonwebtoken");

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

const generateReferralCode = (length = 6) => {
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

const getNextId = async (model) => {
  const data = await model.findOne({
    order: [["id", "DESC"]],
    limit: 1,
  });

  const nextId = data ? data.id + 1 : 1;
  return nextId;
};

const getRefTitle = (refName) => {
  let refTitle = "";
  switch (refName) {
    case "ranking-req":
      refTitle = "Persyaratan Level";
      break;
    case "user-status":
      refTitle = "User Status";
      break;
    case "wallet-type":
      refTitle = "Jenis Wallet";
      break;
    case "withdrawal-status":
      refTitle = "Withdrawal Status";
      break;
    case "bonus-status":
      refTitle = "Bonus Status";
      break;
    case "currency":
      refTitle = "Currency";
      break;
    case "chain":
      refTitle = "Chain";
      break;
  }
  return refTitle;
};

const buildTree = (members, parentId = null) => {
  const tree = [];
  for (const member of members) {
    if (member.member_id_parent === parentId) {
      const children = buildTree(members, member.id);
      tree.push({
        id: member.id,
        name: member.fullname,
        image: member.photo_url,
        attributes: {
          ranking: member.ranking_nm || "Silver",
          status: member.user_status_nm,
          verified: member.email_verified,
        },
        children,
      });
    }
  }
  return tree;
};

const setExpiredOTPInMinutes = (minutes = 15) => {
  const currentDate = new Date(); // Current date and time
  const expiredOTP = new Date(currentDate.getTime() + minutes * 60000);
  return expiredOTP;
};

const sendEmailOTPWallet = async (otp, email) => {
  await transporter.sendMail({
    from: "Anonymous <jayden.gibson29@ethereal.email>", // sender address
    to: email, // list of receivers
    subject: "Kode OTP untuk Verifikasi Wallet", // Subject line
    html: `<p> Halo Fauzi, </p>
       <p> Terima kasih telah melakukan permintaan untuk memperbarui, membuat atau menghapus dompet withdraw Anda. Untuk melanjutkan, silakan masukkan kode OTP berikut untuk verifikasi: </p>
      <p> Kode OTP: </p>
      <span style="display: inline-block; background: #ccc; padding: 4px; font-size: 1.2rem; color: #fff;"> ${otp} </span> <br/>
      <p> Kode ini berlaku selama <b> 15 menit </b>. Mohon jangan bagikan kode ini kepada siapa pun. </p>
      <p> Jika Anda tidak melakukan permintaan ini, silakan abaikan email ini.</p>
      <p>Terima kasih</p>,`, // html body
  });
};

module.exports = {
  generateOtp,
  tryCatch,
  withTransaction,
  isNullOrUndefined,
  toSnakeCase,
  getRequestObject,
  generateReferralCode,
  getNextId,
  getRefTitle,
  buildTree,
  setExpiredOTPInMinutes,
  sendEmailOTPWallet,
};
