const db = require("../config/database");

const {
  withTransaction,
  generateOtp,
  generateReferralCode,
} = require("../utils/helper");
const { STATUS_USER, ROLE } = require("../utils/ref-value");

const rankingRepository = require("../repositories/ranking-repository");
const walletRepository = require("../repositories/wallet-repository");
const userRepository = require("../repositories/user-repository");
const memberRepository = require("../repositories/member-repository");
const productRepository = require("../repositories/product-repository");
const auditService = require("../services/audit-service");

const initModels = require("../models/init-models");
const ResponseError = require("../utils/response-error");
const { member } = initModels(db);

const activationRequestMember = async () => {
  const ranking = await rankingRepository.getActivationReq();
  const results = await walletRepository.getAddressRequestActivation();
  const products = await productRepository.getAll();

  const data = {
    level: ranking.ranking_nm,
    type: ranking.ranking_req
      ? ranking.ranking_reqs[0].ranking_req_type_id
      : "activated",
    amount: ranking.ranking_reqs ? ranking.ranking_reqs[0].value : 100,
    recipient_address: results,
    product: products,
  };

  return data;
};

const confirmPaymentMember = async (data) => {
  const member = await userRepository.getDataById(data.user_id);
  const product = await productRepository.getDataById(1);
  console.log(data);

  const otp = generateOtp();
  await sendEmailOTP(otp, member.email);

  const orderDTO = {
    member_id: data.user_id,
    product_id: product.id,
    price: product.price,
    qty: 1000,
    total_price: 12,
    chain_trx_id: data.trx_id,
    address: data.recipient_address_id,
    coin_id: 123,
    otp: otp,
    expired_otp,
  };
  return withTransaction(async (transaction) => {});
};

const registerMember = async (data, userLogin) => {
  const memberByEmail = await memberRepository.getDataByEmail(data.email);
  if (memberByEmail)
    throw new ResponseError(
      "Email sudah digunakan. Silakan gunakan email lain",
      400
    );

  const memberDTO = {
    email: data.email,
    fullname: data.full_name,
    user_status_id: STATUS_USER.INACTIVE,
    role_id: ROLE.MEMBER,
    referal_code: generateReferralCode(),
    member_id_parent: data.parent_id,
  };

  return withTransaction(async (transaction) => {
    const newMember = await memberRepository.store(memberDTO, transaction);
    // Log Audit
    let dataAudit = {
      user_id: null,
      event: "Registrasi member",
      model_id: newMember.id,
      model_name: member.tableName,
      new_values: newMember,
    };
    await auditService.store(dataAudit);
  });
};

const getDownlineMember = async (memberId, param) => {
  const { page, size, search } = param;
  let result;

  result = await memberRepository.getDataByMemberParentId(memberId, param);

  if (page && size) {
    const totalMember = await memberRepository.getTotalDownlineByMemberParentId(
      memberId
    );
    result = {
      items: result,
      pagination: {
        total_records: parseFloat(totalMember),
        total_pages: Math.ceil(parseFloat(totalMember) / size),
        current_page: page,
      },
    };
  }
  return result;
};

const getAllMember = async (param) => {
  const result = await memberRepository.getAll(param);
  return result;
};

module.exports = {
  activationRequestMember,
  confirmPaymentMember,
  registerMember,
  getDownlineMember,
  getAllMember,
};
