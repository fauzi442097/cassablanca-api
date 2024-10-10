const db = require("../config/database");

const {
  withTransaction,
  generateOtp,
  generateReferralCode,
  buildTree,
  setExpiredOTPInMinutes,
  sendEmailOTPWallet,
} = require("../utils/helper");
const { STATUS_USER, ROLE, RANKING } = require("../utils/ref-value");

const rankingRepository = require("../repositories/ranking-repository");
const walletRepository = require("../repositories/wallet-repository");
const userRepository = require("../repositories/user-repository");
const memberRepository = require("../repositories/member-repository");
const productRepository = require("../repositories/product-repository");
const orderRepository = require("../repositories/order-respository");
const bonusRepository = require("../repositories/bonus-repository");
const userBallanceRepository = require("../repositories/user-ballance-repository");
const withdrawalRepository = require("../repositories/withdrawal-repository");

const auditService = require("../services/audit-service");
const walletService = require("../services/wallet-service");

const initModels = require("../models/init-models");
const ResponseError = require("../utils/response-error");
const {
  member,
  orders,
  ranking,
  ranking_req,
  withdrawal,
  wallet,
  reff_curr,
  product,
} = initModels(db);

const activationRequestMember = async () => {
  const ranking = await rankingRepository.getActivationReq();
  const results = await walletRepository.getAddressRequestActivation();
  const product = await productRepository.getDataById(1);

  const totalUSDT = ranking.ranking_reqs ? ranking.ranking_reqs[0].value : 100;
  const totalORE = totalUSDT / product.price;

  const data = {
    level: ranking.ranking_nm,
    type: ranking.ranking_req
      ? ranking.ranking_reqs[0].ranking_req_type_id
      : "activated",
    activation_details: {
      total_usdt_to_send: totalUSDT,
      ore_balance_received: totalORE,
    },
    recipient_address: results,
    product: product,
  };

  return data;
};

const registerMember = async (data, userId) => {
  const memberByEmail = await memberRepository.getDataByEmail(data.email);
  if (memberByEmail)
    throw new ResponseError(
      "This email address is already registered. Please enter a different email address",
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
      user_id: newMember.id,
      event: "Register member",
      model_id: newMember.id,
      model_name: member.tableName,
      new_values: newMember,
    };
    await auditService.store(dataAudit, transaction);
    await userBallanceRepository.createInitialBallanceMember(newMember.id);
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

const verificationMember = async (orderId, userLoginId) => {
  const memId = Number(orderId);
  if (!Number.isInteger(memId) || memId <= 0) {
    throw new ResponseError(
      "Invalid Parameter. Parameter must be numeric",
      400
    );
  }

  const orderPending = await orderRepository.getDataById(orderId, {
    include: [
      {
        model: product,
        as: "product",
      },
    ],
  });

  const currentMember = await memberRepository.getDataById(
    orderPending.member_id
  );
  if (!currentMember) throw new ResponseError("Data Member not found", 404);

  if (currentMember.user_status_id != STATUS_USER.INACTIVE)
    throw new ResponseError(
      "Unable to activate. The current member status is not pending.",
      400
    );

  if (orderPending.order_sts_id == "done") {
    throw new ResponseError("Member has already been verified", 400);
  }

  const dataApprove = {
    paid_at: new Date(),
    order_sts_id: "done",
  };

  return withTransaction(async (transaction) => {
    await orderRepository.approveOrderById(
      orderPending.id,
      dataApprove,
      transaction
    );

    // Update level member activation to silver
    const memberUpdated = await memberRepository.updateStatusMember(
      currentMember.id,
      {
        ranking_id: "silver",
        user_status_id: STATUS_USER.ACTIVE,
      },
      transaction
    );

    const dataBallance = {
      user_id: currentMember.id,
      curr_id: "ORE",
      amount: orderPending.qty,
      dbcr: 1,
      description: "activation",
    };

    // Add ORE Ballance
    await userBallanceRepository.storeBallance(dataBallance, transaction);

    if (currentMember.member_id_parent) {
      await calculateBonus(
        currentMember.member_id_parent,
        orderPending,
        transaction
      );
    }

    // Log audit member
    const dataAudit = {
      user_id: userLoginId,
      event: `Activate member ${currentMember.fullname}`,
      model_id: currentMember.id,
      model_name: member.tableName,
      old_values: currentMember,
      new_values: memberUpdated,
    };
    await auditService.store(dataAudit, transaction);
  });
};

const calculateBonus = async (memberIdParent, order, transaction) => {
  const parentMember = await memberRepository.getDataById(memberIdParent, {
    include: [
      {
        model: ranking,
        as: "ranking",
        include: [
          {
            model: ranking_req,
            as: "ranking_reqs",
          },
        ],
      },
    ],
  });

  console.log(parentMember);

  const rankingParent = parentMember.ranking;
  if (!rankingParent) throw new ResponseError("Upline ranking is emtpy", 400);

  let rankingRequirements = parentMember.ranking.ranking_reqs;
  const nextLevel = rankingParent.lvl + 1;
  const upRanking = await rankingRepository.getDataByLevel(nextLevel);

  if (upRanking) {
    // get requirement from next level
    rankingRequirements = upRanking.ranking_reqs;
  }

  // Get ref value
  const teamMemberCount = rankingRequirements.find(
    (item) => item.ranking_req_type_id == "team_member_cnt"
  ).value;
  const directMemberCount = rankingRequirements.find(
    (item) => item.ranking_req_type_id == "direct_member_cnt"
  ).value;
  const rankingLine = rankingRequirements.filter(
    (item) => item.ranking_req_type_id == "ranking_member_cnt"
  );

  let requirementTotalLine = true;
  if (rankingLine) {
    for (const rankingMember of rankingLine) {
      const rankingLineCount = rankingMember.value;
      // Get ranking downline by rules
      const downLineRankCount =
        await memberRepository.getTotalDownlineByParentAndRankingId(
          parentMember.id,
          rankingMember.ranking_id_member
        );

      requirementTotalLine = rankingLineCount == downLineRankCount;
    }
  }

  const teamMembers =
    await memberRepository.getTotalDownlineByParentIdAndStatus(
      parentMember.id,
      STATUS_USER.ACTIVE
    );

  const dirrectReferral = await memberRepository.getTotalDirectDownline(
    parentMember.id,
    STATUS_USER.ACTIVE
  );

  let directBonus = rankingParent.direct_bonus;
  let rankingBonus = rankingParent.ranking_bonus;
  let globalBonus = rankingParent.global_bonus;

  if (
    teamMembers == teamMemberCount &&
    dirrectReferral == directMemberCount &&
    requirementTotalLine
  ) {
    // Update level member
    await memberRepository.updateStatusMember(
      parentMember.id,
      { ranking_id: upRanking.id },
      transaction
    );

    directBonus = upRanking.direct_bonus;
    rankingBonus = upRanking.ranking_bonus;
    globalBonus = upRanking.global_bonus;
  }

  // ASSING MEMBER ID PARENT TO ORDER
  order.member_id_parent = parentMember.id;
  await calculateComponentBonus("direct", order, directBonus, transaction);
  await calculateComponentBonus("ranking", order, rankingBonus, transaction);
  await calculateComponentBonus("global", order, globalBonus, transaction);

  if (parentMember.member_id_parent) {
    await calculateBonus(parentMember.member_id_parent, order, transaction);
  }
};

const calculateComponentBonus = async (
  bonusType,
  order,
  componentBonus,
  transaction
) => {
  if (componentBonus != 0) {
    const totalActivation = order.total_price;
    const product = order.product;

    const sharingPctUSDT = product.sharing_pct_usdt;
    const sharingPctProduct = product.sharing_pct_product;

    const t = (totalActivation * componentBonus) / 100;
    const totalUSDT = (t * sharingPctUSDT) / 100;
    const totalORE = (t * sharingPctProduct) / 100 / product.price;

    const bonusStatus = bonusType == "global" ? "unrealized" : "realized";
    const realizedAt = bonusType != "global" && new Date();

    const DTOBonus = [
      {
        member_id: order.member_id_parent,
        curr_id: "USDT",
        amount: totalUSDT,
        order_id: order.id,
        bonus_status_id: bonusStatus,
        realized_at: realizedAt,
        bonus_type_id: bonusType,
      },
      {
        member_id: order.member_id_parent,
        curr_id: "ORE",
        amount: totalORE,
        order_id: order.id,
        bonus_status_id: bonusStatus,
        realized_at: realizedAt,
        bonus_type_id: bonusType,
      },
    ];
    await bonusRepository.storeBonusUpline(DTOBonus, transaction);

    if (bonusType != "global") {
      const ballanceDTO = [
        {
          user_id: order.member_id_parent,
          curr_id: "ORE",
          amount: totalORE,
          dbcr: 1,
          description: bonusType,
        },
        {
          user_id: order.member_id_parent,
          curr_id: "USDT",
          amount: totalUSDT,
          dbcr: 1,
          description: bonusType,
        },
      ];
      await userBallanceRepository.storeBulkBallance(ballanceDTO, transaction);
    }
  }
};

const rejectVerificationMember = async (orderId, userLoginId, data) => {
  const memId = Number(orderId);
  if (!Number.isInteger(memId) || memId <= 0) {
    throw new ResponseError(
      "Invalid Parameter. Parameter must be numeric",
      400
    );
  }

  const orderPending = await orderRepository.getDataById(orderId);

  const currentMember = await memberRepository.getDataById(
    orderPending.member_id
  );
  if (!currentMember) throw new ResponseError("Data Member not found", 404);

  if (currentMember.user_status_id != STATUS_USER.INACTIVE)
    throw new ResponseError(
      "Unable to activate. The current member status is not pending.",
      400
    );

  if (orderPending.order_sts_id == "done") {
    throw new ResponseError("Member has already been verified", 400);
  }

  const dataReject = {
    order_sts_id: "reject",
    reject_reason: data.reason,
  };

  return withTransaction(async (transaction) => {
    const orderRejected = await orderRepository.approveOrderById(
      orderPending.id,
      dataReject,
      transaction
    );

    // Log audit order
    let dataAudit = {
      user_id: userLoginId,
      event: `Reject Verification payment member ${currentMember.fullname}`,
      model_id: orderPending.id,
      model_name: orders.tableName,
      old_values: orderPending,
      new_values: orderRejected,
    };
    await auditService.store(dataAudit, transaction);
  });
};

const getMemberTree = async (parentId) => {
  let membersJSON;
  let result;

  if (parentId) {
    membersJSON = await memberRepository.getDownlineMemberWithSelf(parentId);
    const [memberTree] = buildTree(membersJSON);
    result = memberTree;
  } else {
    const data = await memberRepository.getAllWithoutPaging();
    membersJSON = data.map((item) => {
      let itemJSON = item.toJSON();
      return {
        ...itemJSON,
        ranking_nm: itemJSON.ranking ? itemJSON.ranking.ranking_nm : null,
        user_status_nm: itemJSON.user_status.user_status_nm,
      };
    });
    result = buildTree(membersJSON);
  }

  return result;
};

const blockMember = async (memberId, userLoginId) => {
  const currentMember = await memberRepository.getDataById(memberId);
  if (!currentMember) throw new ResponseError("Data Member not found", 404);

  return withTransaction(async (transaction) => {
    const blockedUser = await memberRepository.updateStatusMember(
      memberId,
      {
        user_status_id: STATUS_USER.BLOCKED,
        old_user_status_id: currentMember.user_status_id,
      },
      transaction
    );

    // Log audit order
    let dataAudit = {
      user_id: userLoginId,
      event: `Block member ${currentMember.fullname}`,
      model_id: memberId,
      model_name: member.tableName,
      old_values: currentMember,
      new_values: blockedUser,
    };
    await auditService.store(dataAudit, transaction);
  });
};

const unBlockMember = async (memberId, userLoginId) => {
  const currentMember = await memberRepository.getDataById(memberId);
  if (!currentMember) throw new ResponseError("Data Member not found", 404);

  return withTransaction(async (transaction) => {
    const unblocked = await memberRepository.updateStatusMember(
      memberId,
      {
        user_status_id: currentMember.old_user_status_id,
        old_user_status_id: null,
      },
      transaction
    );

    // Log audit order
    let dataAudit = {
      user_id: userLoginId,
      event: `Unblock member ${currentMember.fullname}`,
      model_id: memberId,
      model_name: member.tableName,
      old_values: currentMember,
      new_values: unblocked,
    };
    await auditService.store(dataAudit, transaction);
  });
};

const getWalletMember = async (memberId) => {
  const wallets = await walletRepository.getDataByUserId(memberId);
  return wallets;
};

const requestWithdrawalMember = async (data) => {
  const reffCurr = await reff_curr.findOne({ where: { id: "USDT" } });
  if (!reffCurr) throw new ResponseError("USDT Currency not found", 404);

  // Cek saldo dan batas minimum
  if (data.amount < reffCurr.min_withdrawal) {
    throw new ResponseError(
      `Withdrawal failed. Please enter an amount of at least ${reffCurr.min_withdrawal} USDT`,
      404
    );
  }

  const balanceUSDT = await userBallanceRepository.getBallanceUSDT(
    data.user_id
  );
  if (data.amount > balanceUSDT.balance) {
    throw new ResponseError(
      "Withdrawal failed. You do not have enough balance",
      404
    );
  }

  const wallet = await walletRepository.getDataById(data.wallet_id);
  if (!wallet) throw new ResponseError("Wallet not found", 404);

  const withdrawalPending = await withdrawalRepository.getDataByUserIdAndStatus(
    data.user_id,
    "new"
  );
  if (withdrawalPending) {
    throw new ResponseError(
      "Withdrawal failed. You currently have a withdrawal request with a pending status",
      400
    );
  }

  const withdrawalDTO = {
    user_id: data.user_id,
    coin_id: wallet.coin_id,
    address: wallet.address,
    amount: data.amount,
    withdrawal_status_id: "new",
    chain_trx_id: data.transaction_id,
  };

  return withTransaction(async (transaction) => {
    const withdrawalCreated = await withdrawalRepository.store(
      withdrawalDTO,
      transaction
    );

    // Log audit order
    let dataAudit = {
      user_id: data.user_id,
      event: `Request withdrawal`,
      model_id: withdrawalCreated.id,
      model_name: withdrawal.tableName,
      new_values: withdrawalCreated,
    };
    await auditService.store(dataAudit, transaction);
  });
};

const createWallet = async (data, userLogin) => {
  const userId = userLogin.id;
  const roleId = userLogin.role_id;

  const walletTypeId = "withdrawal";

  const currentWallet = await walletRepository.getWalletUniqueMember(
    userId,
    data.coin_id,
    walletTypeId,
    data.address
  );
  if (currentWallet) throw new ResponseError("Wallet already exists", 400);

  const otp = generateOtp();
  const expiredOTP = setExpiredOTPInMinutes(5);

  const member = await memberRepository.getDataById(userId);
  await sendEmailOTPWallet(otp, member.email);

  const walletDTO = {
    coin_id: data.coin_id,
    user_id: userId,
    otp: otp,
    expired_otp: expiredOTP,
    address_temp: data.address,
  };

  if (roleId == ROLE.MEMBER) {
    walletDTO.wallet_type_id = "withdrawal";
  } else {
    // Admin
    walletDTO.wallet_type_id = "deposit";
  }

  return withTransaction(async (transaction) => {
    const walletCreated = await walletRepository.store(walletDTO, transaction);

    // Log audit order
    let dataAudit = {
      user_id: userId,
      event: `Create wallet`,
      model_id: walletCreated.id,
      model_name: wallet.tableName,
      new_values: walletCreated,
    };
    await auditService.store(dataAudit, transaction);

    const { otp, expired_otp, ...dataRespose } = walletCreated.get({
      plain: true,
    });
    return dataRespose;
  });
};

const updateWallet = async (data, userLogin) => {
  const currentWallet = await walletRepository.getDataByIdAndUserId(
    data.wallet_id,
    userLogin.id
  );

  if (!currentWallet) throw new ResponseError("Wallet not found", 400);

  if (currentWallet.address_temp) {
    throw new ResponseError(
      "Update failed. Please verify your data before updating your wallet information",
      400
    );
  }

  const otp = generateOtp();
  const expiredOTP = setExpiredOTPInMinutes(5);

  const member = await memberRepository.getDataById(userLogin.id);
  await sendEmailOTPWallet(otp, member.email);

  const walletDTO = {
    address_temp: data.address,
    otp: otp,
    expired_otp: expiredOTP,
  };

  return withTransaction(async (transaction) => {
    const walletUpdated = await walletRepository.update(
      data.wallet_id,
      walletDTO,
      transaction
    );

    // Log audit order
    let dataAudit = {
      user_id: userLogin.id,
      event: `Update wallet`,
      model_id: data.wallet_id,
      model_name: wallet.tableName,
      old_values: currentWallet,
      new_values: walletUpdated,
    };
    await auditService.store(dataAudit, transaction);

    const [result] = walletUpdated[1];
    const { otp, expired_otp, ...dataRespose } = result.get({ plain: true });
    return dataRespose;
  });
};

const getSingWalletMemberById = async (memberId, walletId) => {
  const currentWallet = await walletRepository.getDataByIdAndUserId(
    walletId,
    memberId
  );
  if (!currentWallet) throw new ResponseError("Wallet not found", 400);

  return currentWallet;
};

const verifyOTPWallet = async (dataOTP, userLoginId) => {
  const currentWallet = await walletRepository.getDataById(dataOTP.wallet_id);
  if (!currentWallet) throw new ResponseError("Wallet not found", 400);

  // const walletOtp = await walletRepository.getDataByOTP(dataOTP.otp);

  if (currentWallet.otp != dataOTP.otp)
    throw new ResponseError(
      "Invalid OTP. Please check the code and enter it again",
      401
    );

  const currentData = new Date();
  if (currentData > currentWallet.expired_otp) {
    throw new ResponseError(
      "OTP code has expired. Please request a new code",
      401
    );
  }

  return withTransaction(async (transaction) => {
    const walletUpdated = await walletRepository.verificationWallet(
      dataOTP.wallet_id,
      currentWallet.address_temp,
      transaction
    );

    // Log audit order
    let dataAudit = {
      user_id: userLoginId,
      event: `Verification OTP wallet`,
      model_id: dataOTP.wallet_id,
      model_name: wallet.tableName,
      old_values: currentWallet,
      new_values: walletUpdated,
    };
    await auditService.store(dataAudit, transaction);
  });
};

const resendOTPWallet = async (data, emailUserLogin, userLoginId) => {
  const currentWallet = await walletRepository.getDataById(data.wallet_id);
  if (!currentWallet) throw new ResponseError("Wallet not found", 400);

  const otp = generateOtp();
  const expiredOTP = setExpiredOTPInMinutes(5);

  await sendEmailOTPWallet(otp, emailUserLogin);

  const walletDTO = {
    otp: otp,
    expired_otp: expiredOTP,
  };

  return withTransaction(async (transaction) => {
    const walletUpdated = await walletRepository.update(
      data.wallet_id,
      walletDTO,
      transaction
    );

    // Log audit order
    let dataAudit = {
      user_id: userLoginId,
      event: `Resend OTP verification wallet`,
      model_id: data.wallet_id,
      model_name: wallet.tableName,
      old_values: currentWallet,
      new_values: walletUpdated,
    };
    await auditService.store(dataAudit, transaction);
  });
};

const deleteWallet = async (param) => {
  const { memberId, walletId, otp, userId } = param;
  const currentWallet = await walletRepository.getDataByIdAndUserId(
    walletId,
    memberId
  );

  if (!currentWallet) throw new ResponseError("Wallet not found", 400);

  const walletOtp = await walletRepository.getDataByOTP(otp);
  if (!walletOtp)
    throw new ResponseError(
      "Invalid OTP. Please check the code and enter it again",
      401
    );

  const currentData = new Date();
  if (currentData > currentWallet.expired_otp) {
    throw new ResponseError(
      "OTP code has expired. Please request a new code",
      401
    );
  }

  return withTransaction(async (transaction) => {
    const walletDeleted = await walletRepository.deleteById(
      walletId,
      transaction
    );

    // Log audit order
    let dataAudit = {
      user_id: userId,
      event: `Delete wallet`,
      model_id: walletId,
      model_name: wallet.tableName,
      old_values: walletDeleted,
    };
    await auditService.store(dataAudit, transaction);
  });
};

const getBalanceMember = async (userId) => {
  const result = await userBallanceRepository.getDataByUserId(userId);
  return result;
};

const getHistoryTransactionBalance = async (userId, param) => {
  return await userBallanceRepository.getHistoryTrxByUserId(userId, param);
};

const getHistoryWithdrawal = async (userId, param) => {
  return await withdrawalRepository.getDataByUserId(userId, param);
};

const updateMember = async (memberId, data, userIdLogin) => {
  const memId = Number(memberId);
  if (!Number.isInteger(memId) || memId <= 0) {
    throw new ResponseError(
      "Invalid Parameter. Parameter must be numeric",
      400
    );
  }

  const currentMember = await memberRepository.getDataById(memberId);
  if (!currentMember) throw new ResponseError("Data Member not found", 404);

  if (currentMember.email_verified) {
    throw new ResponseError(
      "Member cannot be updated as the account has already been verified",
      400
    );
  }

  return withTransaction(async (transaction) => {
    const updatedMember = await memberRepository.updateMember(
      memberId,
      {
        email: data.email,
      },
      transaction
    );

    // Log audit order
    let dataAudit = {
      user_id: userIdLogin,
      event: `Update member`,
      model_id: memberId,
      model_name: wallet.tableName,
      old_values: currentMember,
      new_values: updatedMember,
    };
    await auditService.store(dataAudit, transaction);
  });
};

const getRekapMember = async (req) => {
  const userId = req.user.id;
  const roleId = req.user.role_id;
  let rekapMember;

  if (roleId == ROLE.MEMBER) {
    rekapMember = await memberRepository.getRekapMemberByParentId(userId);
  } else {
    rekapMember = await memberRepository.getRekapAllMember();
  }

  return {
    activated_member: {
      total: parseFloat(rekapMember.activated_member),
    },
    inactivated_member: {
      total: parseFloat(rekapMember.inactivated_member),
    },
    blocked_member: {
      total: parseFloat(rekapMember.blocked_member),
    },
    total: parseFloat(rekapMember.total),
  };
};

module.exports = {
  activationRequestMember,
  registerMember,
  getDownlineMember,
  getMembers,
  verificationMember,
  rejectVerificationMember,
  getMemberTree,
  blockMember,
  getWalletMember,
  requestWithdrawalMember,
  createWallet,
  updateWallet,
  getSingWalletMemberById,
  verifyOTPWallet,
  resendOTPWallet,
  deleteWallet,
  getBalanceMember,
  getHistoryTransactionBalance,
  getHistoryWithdrawal,
  unBlockMember,
  updateMember,
  getRekapMember,
};
