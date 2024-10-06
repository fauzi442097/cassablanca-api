const ResponseError = require("../utils/response-error");

const productRepository = require("../repositories/product-repository");
const walletRepository = require("../repositories/wallet-repository");
const orderRepository = require("../repositories/order-respository");

const auditService = require("../services/audit-service");
const initModels = require("../models/init-models");
const db = require("../config/database");
const { withTransaction } = require("../utils/helper");

const { orders } = initModels(db);

const confirmPaymentMember = async (data) => {
  const product = await productRepository.getDataById(data.product_id);
  if (!product) throw new ResponseError("Product not found", 404);

  const wallet = await walletRepository.getDataById(data.address_wallet_id);
  if (!wallet) throw new ResponseError("Address wallet not found", 404);

  let order;
  if (!data.order_id) {
    const orderPending = await orderRepository.getOrderPendingByMemberAndTrxId(
      data.member_id,
      data.transaction_id
    );

    if (orderPending) {
      throw new ResponseError("Transaction is still in pending status", 400);
    }
  } else {
    order = await orderRepository.getOrderByid(data.order_id);
    if (order.order_sts_id == "waiting_approve") {
      throw new ResponseError("Transaction is still in pending status", 400);
    }
  }

  const total = product.price * data.qty;

  const orderDTO = {
    member_id: data.member_id,
    product_id: product.id,
    price: product.price,
    qty: data.qty,
    total_price: total,
    chain_trx_id: data.transaction_id,
    address: wallet.address,
    coin_id: wallet.coin_id,
    order_sts_id: "waiting_approve",
  };

  return withTransaction(async (transaction) => {
    const response = await orderRepository.store(
      orderDTO,
      data.order_id,
      transaction
    );
    let dataAudit = {
      user_id: data.user_id,
      event: "Payment confirmation",
      model_id: data.order_id || response.id,
      model_name: orders.tableName,
      old_values: order,
      new_values: response,
    };
    await auditService.store(dataAudit, transaction);
  });
};

const getAll = async (params) => {
  return await orderRepository.getAll(params);
};

module.exports = {
  confirmPaymentMember,
  getAll,
};
