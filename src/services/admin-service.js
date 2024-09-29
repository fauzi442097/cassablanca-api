const walletRepository = require("../repositories/wallet-repository");
const memberRepository = require("../repositories/member-repository");
const bonusRepository = require("../repositories/bonus-repository");
const userBallanceRepository = require("../repositories/user-ballance-repository");
const orderRepository = require("../repositories/order-respository");

const auditService = require("../services/audit-service");

const { withTransaction } = require("../utils/helper");
const initModels = require("../models/init-models");
const db = require("../config/database");

const { users_balance_trx } = initModels(db);

const getWalletAdmin = async () => {
  const depositWallet = await walletRepository.getWalletAdminByType("deposit");
  const withdrawalWallet = await walletRepository.getWalletAdminByType(
    "withdrawal"
  );

  return {
    wallet: {
      deposit: depositWallet,
      withdrawal: withdrawalWallet,
    },
  };
};

const getBonusMember = async (queryParams) => {
  return await memberRepository.getTotalBonusByStatusOrder(
    queryParams,
    "unrealized"
  );
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
        event: `Distribusi bonus member`,
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
        { bonus_status_id: "realized" },
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

module.exports = {
  getWalletAdmin,
  getBonusMember,
  distributBonusMember,
  historyVerification,
};
