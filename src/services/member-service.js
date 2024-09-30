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
const { member, orders, ranking, ranking_req, withdrawal, wallet, reff_curr } =
  initModels(db);

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

const verificationMember = async (memberId, userLoginId) => {
  const memId = Number(memberId);
  if (!Number.isInteger(memId) || memId <= 0) {
    throw new ResponseError("Parameter must be numeric", 404);
  }

  const currentMember = await memberRepository.getDataById(memberId);
  if (!currentMember) throw new ResponseError("Data Member not found", 404);

  if (currentMember.user_status_id != STATUS_USER.INACTIVE)
    throw new ResponseError(
      "Unable to activate. The current member status is not pending.",
      400
    );

  if (!currentMember.member_id_parent) {
    throw new ResponseError("Upline member not found", 400);
  }

  const orderPending = await orderRepository.getOrderPendingByMemberId(
    memberId
  );
  if (!orderPending) {
    throw new ResponseError("Member has already been verified", 400);
  }

  const dataApprove = {
    paid_at: new Date(),
    order_sts_id: "done",
  };

  return withTransaction(async (transaction) => {
    const orderUpdated = await orderRepository.approveOrderById(
      orderPending.id,
      dataApprove,
      transaction
    );

    // Update level member activation to silver
    const memberUpdated = await memberRepository.updateStatusMember(
      memberId,
      { ranking_id: "silver" },
      transaction
    );

    // Log audit order
    let dataAudit = {
      user_id: userLoginId,
      event: `Approve verification payment member ${currentMember.fullname}`,
      model_id: orderPending.id,
      model_name: orders.tableName,
      old_values: orderPending,
      new_values: orderUpdated,
    };
    await auditService.store(dataAudit, transaction);

    // Log audit member
    dataAudit = {
      user_id: userLoginId,
      event: `Update ranking member ${currentMember.fullname}`,
      model_id: currentMember.id,
      model_name: member.tableName,
      old_values: currentMember,
      new_values: memberUpdated,
    };
    await auditService.store(dataAudit, transaction);

    const dataBallance = {
      user_id: currentMember.id,
      curr_id: "ORE",
      amount: orderPending.qty,
      dbcr: 1,
      description: "Kredit saldo ORE",
    };

    // Add ORE Ballance
    await userBallanceRepository.storeBallance(dataBallance, transaction);

    await calculateBonus(
      currentMember.member_id_parent,
      orderPending,
      transaction
    );
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
  const rankingLine = rankingRequirements.find(
    (item) => item.ranking_req_type_id == "ranking_member_cnt"
  );

  let requirementTotalLine = true;
  if (rankingLine) {
    // Get ranking downline by rules
    const rankingLineCount = rankingLine.value;
    const downineRankCount =
      await memberRepository.getTotalDownlineByParentAndRankingId(
        parentMember.id,
        rankingLine.ranking_id_member
      );
    requirementTotalLine = rankingLineCount == downineRankCount;
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
  order.member_id_parent = parentMember.id;

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

  await calculateComponentBonus(order, directBonus, transaction);
  await calculateComponentBonus(order, rankingBonus, transaction);
  await calculateComponentBonus(order, globalBonus, transaction);

  if (parentMember.member_id_parent) {
    await calculateBonus(parentMember.member_id_parent, order, transaction);
  }
};

const calculateComponentBonus = async (order, componentBonus, transaction) => {
  if (componentBonus != 0) {
    const totalActivation = order.total_price;
    const product = order.product;

    const sharingPctUSDT = product.sharing_pct_usdt;
    const sharingPctProduct = product.sharing_pct_product;

    const t = (totalActivation * componentBonus) / 100;
    const totalUSDT = (t * sharingPctUSDT) / 100;
    const totalORE = (t * sharingPctProduct) / 100 / product.price;

    console.log({ totalUSDT, totalORE });

    const DTOBonus = [
      {
        member_id: order.member_id_parent,
        curr_id: "USDT",
        amount: totalUSDT,
        order_id: order.id,
        bonus_status_id: "unrealized",
      },
      {
        member_id: order.member_id_parent,
        curr_id: "ORE",
        amount: totalORE,
        order_id: order.id,
        bonus_status_id: "unrealized",
      },
    ];

    await bonusRepository.storeBonusUpline(DTOBonus, transaction);
  }
};

const rejectVerificationMember = async (memberId, userLoginId) => {
  const memId = Number(memberId);
  if (!Number.isInteger(memId) || memId <= 0) {
    throw new ResponseError("Parameter must be numeric", 404);
  }

  const currentMember = await memberRepository.getDataById(memberId);
  if (!currentMember) throw new ResponseError("Data Member not found", 404);

  if (currentMember.user_status_id != STATUS_USER.INACTIVE)
    throw new ResponseError(
      "Unable to activate. The current member status is not pending.",
      400
    );

  const orderPending = await orderRepository.getOrderPendingByMemberId(
    memberId
  );
  if (!orderPending) {
    throw new ResponseError("Member has already been verified", 400);
  }

  const dataReject = {
    order_sts_id: "reject",
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
  const data = await memberRepository.getAllWithoutPaging();
  const membersJSON = data.map((member) => member.toJSON());
  let memberTree = buildTree(membersJSON);

  if (parentId) {
    memberTree = memberTree.filter((item) => item.id == parentId);
  }
  return memberTree;
};

const blockMember = async (memberId, userLoginId) => {
  const currentMember = await memberRepository.getDataById(memberId);
  if (!currentMember) throw new ResponseError("Data Member not found", 404);

  return withTransaction(async (transaction) => {
    const blockedUser = await memberRepository.updateStatusMember(
      memberId,
      { user_status_id: STATUS_USER.BLOCKED },
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

  const currentWallet = await walletRepository.getWalletByUserIdAndCoinId(
    userId,
    data.coin_id
  );
  if (currentWallet) throw new ResponseError("Wallet already exists", 400);

  const otp = generateOtp();
  const expiredOTP = setExpiredOTPInMinutes(15);

  const member = await memberRepository.getDataById(userId);
  await sendEmailOTPWallet(otp, member.email);

  const walletDTO = {
    coin_id: data.coin_id,
    address: data.address,
    user_id: userId,
    verified: false,
    otp: otp,
    expired_otp: expiredOTP,
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

    return walletCreated;
  });
};

const updateWallet = async (data, userLogin) => {
  const currentWallet = await walletRepository.getDataByIdAndUserId(
    data.wallet_id,
    userLogin.id
  );

  if (!currentWallet) throw new ResponseError("Wallet not found", 400);

  const otp = generateOtp();
  const expiredOTP = setExpiredOTPInMinutes(15);

  const member = await memberRepository.getDataById(userLogin.id);
  await sendEmailOTPWallet(otp, member.email);

  const walletDTO = {
    address: data.address,
    verified: false,
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
      event: `Ubah wallet`,
      model_id: data.wallet_id,
      model_name: wallet.tableName,
      old_values: currentWallet,
      new_values: walletUpdated,
    };
    await auditService.store(dataAudit, transaction);

    const [result] = walletUpdated[1];
    return result;
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
  const currentWallet = await walletRepository.getDataByIdAndUserId(
    dataOTP.wallet_id,
    userLoginId
  );
  if (!currentWallet) throw new ResponseError("Wallet not found", 400);

  const walletOtp = await walletRepository.getDataByOTP(dataOTP.otp);
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
    const walletUpdated = await walletRepository.verificationWallet(
      dataOTP.wallet_id,
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

const resendOTPWallet = async (data, userLoginId) => {
  const currentWallet = await walletRepository.getDataByIdAndUserId(
    data.wallet_id,
    userLoginId
  );

  if (!currentWallet) throw new ResponseError("Wallet not found", 400);

  if (currentWallet.verified)
    throw new ResponseError("Unable to proceed. Data is already verified", 400);

  const otp = generateOtp();
  const expiredOTP = setExpiredOTPInMinutes(15);

  const member = await memberRepository.getDataById(userLoginId);
  await sendEmailOTPWallet(otp, member.email);

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
};
