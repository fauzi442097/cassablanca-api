const walletRepository = require("../repositories/wallet-repository");
const memberRepository = require("../repositories/member-repository");
const bonusRepository = require("../repositories/bonus-repository");
const userBallanceRepository = require("../repositories/user-ballance-repository");
const orderRepository = require("../repositories/order-respository");
const withdrawalRepository = require("../repositories/withdrawal-repository");

const auditService = require("../services/audit-service");

const { withTransaction } = require("../utils/helper");
const initModels = require("../models/init-models");
const db = require("../config/database");
const ResponseError = require("../utils/response-error");

const { users_balance_trx, withdrawal, reff_bonus_status } = initModels(db);

const getWalletAdmin = async () => {
  return await walletRepository.getWalletAdminByType("deposit");
};

const getBonusMember = async (bonusStatus, queryParams) => {
  const refBonusStatus = await reff_bonus_status.findByPk(bonusStatus);
  if (!refBonusStatus)
    throw new ResponseError(`Invalid param value of '${bonusStatus}'`);
  const bonus = await memberRepository.getTotalBonusByStatusOrder(
    queryParams,
    bonusStatus
  );

  return bonus;
};

const distributBonusMember = async (idMembers, userLoginId) => {
  const bonusMembers = await bonusRepository.getTotalBonusMemberByStatus(
    idMembers,
    "unrealized"
  );

  const bonusMemberJSON = bonusMembers.map((item) => item.toJSON());

  return withTransaction(async (transaction) => {
    for (const bonus of bonusMemberJSON) {
      const ballanceDTO = [
        {
          user_id: bonus.member_id,
          curr_id: "ORE",
          amount: bonus.total_ore,
          dbcr: 1,
          description: "Kredit saldo ORE",
        },
        {
          user_id: bonus.member_id,
          curr_id: "USDT",
          amount: bonus.total_usdt,
          dbcr: 1,
          description: "Kredit saldo USDT",
        },
      ];

      const ballanceCreated = await userBallanceRepository.storeBulkBallance(
        ballanceDTO,
        transaction
      );

      let auditDTO = {
        user_id: userLoginId,
        event: `Bonus distribution to member`,
        model_id: ballanceCreated.map((item) => item.id).join(", "),
        model_name: users_balance_trx.tableName,
        new_values: ballanceCreated,
      };
      await auditService.store(auditDTO, transaction);

      // get member status realized
      const oldUserBallance = await bonusRepository.getBonusMemberByStatus(
        bonus.member_id,
        "unrealized"
      );

      // Update status
      const dataUpdated = await bonusRepository.setStatusToRealized(
        bonus.member_id,
        {
          bonus_status_id: "realized",
          realized_at: new Date(),
        },
        transaction
      );

      auditDTO = {
        user_id: userLoginId,
        event: `Update status bonus member`,
        model_id: oldUserBallance.map((item) => item.id).join(", "),
        model_name: users_balance_trx.tableName,
        old_values: oldUserBallance,
        new_values: dataUpdated,
      };
      await auditService.store(auditDTO, transaction);
    }

    return bonusMembers;
  });
};

const historyVerification = async (filter) => {
  return await orderRepository.getHistoryOrder(filter);
};

const getAllWithdrawalMember = async (queryParams) => {
  return await withdrawalRepository.getAll(queryParams);
};

const rejectWithdrawalMember = async (withdrawalId, userLoginId) => {
  const witdrawalMember = await withdrawalRepository.getDataById(withdrawalId);
  if (!witdrawalMember) throw new ResponseError("Data not found", 404);

  return withTransaction(async (transaction) => {
    const dataUpdated = await withdrawalRepository.updateStatusWithdrawal(
      withdrawalId,
      "rejected",
      transaction
    );

    const auditDTO = {
      user_id: userLoginId,
      event: `Reject withdrawal member`,
      model_id: withdrawalId,
      model_name: withdrawal.tableName,
      old_values: witdrawalMember,
      new_values: dataUpdated,
    };
    await auditService.store(auditDTO, transaction);
  });
};

const approveWithdrawalMember = async (withdrawalId, userLoginId) => {
  const witdrawalMember = await withdrawalRepository.getDataById(withdrawalId);
  if (!witdrawalMember) throw new ResponseError("Data not found", 404);

  const withdrawalDTO = {
    user_id_admin: userLoginId,
    paid_at: new Date(),
    withdrawal_status_id: "done",
  };

  return withTransaction(async (transaction) => {
    const dataUpdated = await withdrawalRepository.updateWithdrawal(
      withdrawalId,
      withdrawalDTO,
      transaction
    );

    const trxBalanceDTO = {
      user_id: witdrawalMember.user_id,
      curr_id: "USDT",
      amount: witdrawalMember.amount,
      dbcr: 0,
      description: "Debet saldo USDT",
    };
    const ballanceCreated = await userBallanceRepository.storeBallance(
      trxBalanceDTO,
      transaction
    );
    let auditDTO = {
      user_id: userLoginId,
      event: `Update member balance`,
      model_id: ballanceCreated.id,
      model_name: users_balance_trx.tableName,
      new_values: ballanceCreated,
    };
    await auditService.store(auditDTO, transaction);

    auditDTO = {
      user_id: userLoginId,
      event: `Approve withdrawal member`,
      model_id: withdrawalId,
      model_name: withdrawal.tableName,
      old_values: witdrawalMember,
      new_values: dataUpdated,
    };
    await auditService.store(auditDTO, transaction);
  });
};

module.exports = {
  getWalletAdmin,
  getBonusMember,
  distributBonusMember,
  historyVerification,
  getAllWithdrawalMember,
  rejectWithdrawalMember,
  approveWithdrawalMember,
};
