const userBallanceRepository = require("../repositories/user-ballance-repository");
const memberRepository = require("../repositories/member-repository");
const orderRepository = require("../repositories/order-respository");
const withdrawalRepository = require("../repositories/withdrawal-repository");

const initModels = require("../models/init-models");
const db = require("../config/database");

const { ranking } = initModels(db);

const getDashboardMember = async (req) => {
  const userId = req.user.id;

  const balance = await userBallanceRepository.getDataByUserId(userId);
  const balanceORE =
    balance.find((item) => item.curr_id == "ORE")?.balance || 0;
  const balanceUSDT =
    balance.find((item) => item.curr_id == "USDT")?.balance || 0;

  const member = await memberRepository.getDataById(userId, {
    include: [{ model: ranking, as: "ranking" }],
  });

  const totalMember = await memberRepository.getTotalDownlineByMemberParentId(
    userId
  );

  const totalDirectDownline = await memberRepository.getTotalDirectDownline(
    userId
  );

  const memberDirectDownline =
    await memberRepository.getMemberDirectDownlineWithTotal(userId);

  const dataResponse = {
    balance: {
      ore: balanceORE,
      usdt: balanceUSDT,
    },
    total_member: totalMember,
    total_referral: totalDirectDownline,
    user: {
      referral_code: member.referal_code,
      ranking: member.ranking.ranking_nm,
    },
    direct_member_referral: memberDirectDownline,
  };

  return dataResponse;
};

const getDashboardAdmin = async (req) => {
  const rekapMemberbyStatus = await memberRepository.rekapMemberByStatus();

  let totalMember = 0;
  const groupedMember = rekapMemberbyStatus.reduce(
    (acc, { user_status_nm, total }) => {
      acc[user_status_nm.toLowerCase()] = parseFloat(total);
      totalMember += parseFloat(total);
      return acc;
    },
    {}
  );

  // const balance = await userBallanceRepository.getDataByUserId(0);
  // const balanceORE =
  //   balance.find((item) => item.curr_id == "ORE")?.balance || 0;
  // const balanceUSDT =
  //   balance.find((item) => item.curr_id == "USDT")?.balance || 0;

  const requestActivation = await orderRepository.getOrderPending({
    limit: 5,
  });
  const requestWithdrawal = await withdrawalRepository.getWithdrawalPending({
    limit: 5,
  });

  const dataResponse = {
    // balance: {
    //   ore: balanceORE,
    //   usdt: balanceUSDT,
    // },
    rekap_member: {
      total: totalMember,
      ...groupedMember,
    },
    request_activation: requestActivation,
    request_withdrawal: requestWithdrawal,
  };

  return dataResponse;
};

module.exports = {
  getDashboardMember,
  getDashboardAdmin,
};
