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
const orderRepository = require("../repositories/order-respository");
const userBallanceRepository = require("../repositories/user-ballance-repository");

const auditService = require("../services/audit-service");

const initModels = require("../models/init-models");
const ResponseError = require("../utils/response-error");
const { member, orders } = initModels(db);

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
    await auditService.store(dataAudit, transaction);
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

const getMembers = async (param) => {
  const result = await memberRepository.getAll(param);
  return result;
};

const verificationMember = async (memberId, userLoginId) => {
  const memId = Number(memberId);
  if (!Number.isInteger(memId) || memId <= 0) {
    throw new ResponseError("Parameter harus angka", 404);
  }

  const currentMember = await memberRepository.getDataById(memberId);
  if (!currentMember)
    throw new ResponseError("Data Member tidak ditemukan", 404);

  if (currentMember.user_status_id != STATUS_USER.INACTIVE)
    throw new ResponseError(
      "Aktivasi tidak diizinkan. Status member tidak dalam keadaan pending",
      400
    );

  const orderPending = await orderRepository.getOrderPendingByMemberId(
    memberId
  );
  if (!orderPending) {
    throw new ResponseError("Member sudah dilakukan verifikasi", 400);
  }

  const dataApprove = {
    paid_at: new Date(),
    order_sts_id: "done",
  };

  const dataStatusMember = {
    ranking_id: "silver",
  };

  return withTransaction(async (transaction) => {
    // const orderUpdated = await orderRepository.approveOrderById(
    //   orderPending.id,
    //   dataApprove,
    //   transaction
    // );

    // // Log audit order
    // let dataAudit = {
    //   user_id: userLoginId,
    //   event: `Verifikasi pembayaran member ${currentMember.fullname}`,
    //   model_id: orderPending.id,
    //   model_name: orders.tableName,
    //   old_values: orderPending,
    //   new_values: orderUpdated,
    // };
    // await auditService.store(dataAudit, transaction);

    // const memberUpdated = await memberRepository.updateStatusMember(
    //   memberId,
    //   dataStatusMember,
    //   transaction
    // );

    // // Log audit member
    // dataAudit = {
    //   user_id: userLoginId,
    //   event: `Update ranking member ${currentMember.fullname}`,
    //   model_id: currentMember.id,
    //   model_name: member.tableName,
    //   old_values: currentMember,
    //   new_values: memberUpdated,
    // };
    // await auditService.store(dataAudit, transaction);

    const dataBallance = {
      user_id: currentMember.id,
      curr_id: "ORE",
      amount: orderPending.qty,
      dbcr: 1,
      description: "Penambahan saldo ORE",
    };

    const ballanceCreated = await userBallanceRepository.storeBallance(
      dataBallance,
      transaction
    );
  });
};

module.exports = {
  activationRequestMember,
  registerMember,
  getDownlineMember,
  getMembers,
  verificationMember,
};
