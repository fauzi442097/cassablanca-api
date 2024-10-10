const userBallanceRepository = require("../repositories/user-ballance-repository");
const memberRepository = require("../repositories/member-repository");
const orderRepository = require("../repositories/order-respository");
const withdrawalRepository = require("../repositories/withdrawal-repository");

const memberService = require("../services/member-service");

const initModels = require("../models/init-models");
const db = require("../config/database");
const { Op } = require("sequelize");
const { getThisMonth } = require("../utils/helper");

const { ranking } = initModels(db);

const getDashboardMember = async (req) => {
  const userId = req.user.id;
  const { limit } = req.query;

  const balance = await userBallanceRepository.getDataByUserId(userId);
  const balanceORE =
    balance.find((item) => item.curr_id == "ORE")?.balance || 0;
  const balanceUSDT =
    balance.find((item) => item.curr_id == "USDT")?.balance || 0;

  const member = await memberRepository.getDataById(userId, {
    include: [{ model: ranking, as: "ranking" }],
  });

  const rekapMember = await memberRepository.getRekapMemberByParentId(userId);

  const downlineMember = await memberRepository.getDataByMemberParentId(userId);
  const arrDownlineMemberId = downlineMember
    ? downlineMember.map((item) => item.id)
    : [];

  // ACTIVATION
  const { startDate, endDate } = getThisMonth();
  const totalActivationThisMonth =
    await orderRepository.getTotalActivationMember({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate],
        },
        member_id: {
          [Op.in]: arrDownlineMemberId,
        },
        order_sts_id: "done",
      },
    });

  const requestActivation = await orderRepository.getRecentActivationDownline(
    arrDownlineMemberId,
    {
      limit: limit || 10,
    }
  );

  // TRANSACTION
  const transactions =
    await userBallanceRepository.getRecentTransactionDownline(
      arrDownlineMemberId,
      {
        limit: limit || 10,
      }
    );

  const totalTransaction = await userBallanceRepository.getTotalTransaction({
    where: {
      created_at: {
        [Op.between]: [startDate, endDate],
      },
      user_id: {
        [Op.in]: arrDownlineMemberId,
      },
    },
  });

  const dataResponse = {
    balance: {
      ore: balanceORE,
      usdt: balanceUSDT,
    },
    rekap_member: rekapMember,
    user: {
      referral_code: member.referal_code,
      ranking: member.ranking.ranking_nm,
    },
    recent_activations: {
      total_this_month: totalActivationThisMonth,
      list: requestActivation,
    },
    recent_transactions: {
      total_this_month: totalTransaction,
      list: transactions,
    },
  };

  return dataResponse;
};

const getDashboardAdmin = async (req) => {
  const rekapMember = await memberService.getRekapMember(req);

  // const balance = await userBallanceRepository.getDataByUserId(0);
  // const balanceORE =
  //   balance.find((item) => item.curr_id == "ORE")?.balance || 0;
  // const balanceUSDT =
  //   balance.find((item) => item.curr_id == "USDT")?.balance || 0;

  const { limit } = req.query;
  const { startDate, endDate } = getThisMonth();

  // ACTIVATION
  const requestActivation = await orderRepository.getOrderByStatus(["done"], {
    limit: limit || 10,
  });

  const totalActivation = await orderRepository.getTotalActivationMember({
    where: {
      created_at: {
        [Op.between]: [startDate, endDate],
      },
      order_sts_id: "done",
    },
  });

  // WITHDRAWAL
  const requestWithdrawal = await withdrawalRepository.getWithdrawalByStatus(
    ["done"],
    {
      limit: limit || 10,
    }
  );

  const totalWithdrawal = await withdrawalRepository.getTotalWithdrawalMember({
    where: {
      created_at: {
        [Op.between]: [startDate, endDate],
      },
      withdrawal_status_id: "done",
    },
  });

  const dataResponse = {
    // balance: {
    //   ore: balanceORE,
    //   usdt: balanceUSDT,
    // },
    rekap_member: rekapMember,
    recent_activations: {
      total_this_month: totalActivation,
      list: requestActivation,
    },
    recent_withdrawal: {
      total_this_month: totalWithdrawal,
      list: requestWithdrawal,
    },
  };

  return dataResponse;
};

module.exports = {
  getDashboardMember,
  getDashboardAdmin,
};
