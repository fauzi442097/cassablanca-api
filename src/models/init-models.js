var DataTypes = require("sequelize").DataTypes;
var _audits = require("./audits");
var _bonus = require("./bonus");
var _coin = require("./coin");
var _member = require("./member");
var _orders = require("./orders");
var _person = require("./person");
var _product = require("./product");
var _ranking = require("./ranking");
var _ranking_req = require("./ranking_req");
var _reff_bonus_status = require("./reff_bonus_status");
var _reff_chain = require("./reff_chain");
var _reff_curr = require("./reff_curr");
var _reff_menu = require("./reff_menu");
var _reff_order_status = require("./reff_order_status");
var _reff_ranking_req_type = require("./reff_ranking_req_type");
var _reff_user_status = require("./reff_user_status");
var _reff_wallet_type = require("./reff_wallet_type");
var _reff_withdrawal_status = require("./reff_withdrawal_status");
var _role_menu = require("./role_menu");
var _roles = require("./roles");
var _users = require("./users");
var _users_balance = require("./users_balance");
var _users_balance_trx = require("./users_balance_trx");
var _wallet = require("./wallet");
var _withdrawal = require("./withdrawal");

function initModels(sequelize) {
  var audits = _audits(sequelize, DataTypes);
  var bonus = _bonus(sequelize, DataTypes);
  var coin = _coin(sequelize, DataTypes);
  var member = _member(sequelize, DataTypes);
  var orders = _orders(sequelize, DataTypes);
  var person = _person(sequelize, DataTypes);
  var product = _product(sequelize, DataTypes);
  var ranking = _ranking(sequelize, DataTypes);
  var ranking_req = _ranking_req(sequelize, DataTypes);
  var reff_bonus_status = _reff_bonus_status(sequelize, DataTypes);
  var reff_chain = _reff_chain(sequelize, DataTypes);
  var reff_curr = _reff_curr(sequelize, DataTypes);
  var reff_menu = _reff_menu(sequelize, DataTypes);
  var reff_order_status = _reff_order_status(sequelize, DataTypes);
  var reff_ranking_req_type = _reff_ranking_req_type(sequelize, DataTypes);
  var reff_user_status = _reff_user_status(sequelize, DataTypes);
  var reff_wallet_type = _reff_wallet_type(sequelize, DataTypes);
  var reff_withdrawal_status = _reff_withdrawal_status(sequelize, DataTypes);
  var role_menu = _role_menu(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var users_balance = _users_balance(sequelize, DataTypes);
  var users_balance_trx = _users_balance_trx(sequelize, DataTypes);
  var wallet = _wallet(sequelize, DataTypes);
  var withdrawal = _withdrawal(sequelize, DataTypes);

  reff_menu.belongsToMany(roles, {
    as: "role_id_roles",
    through: role_menu,
    foreignKey: "menu_id",
    otherKey: "role_id",
  });
  roles.belongsToMany(reff_menu, {
    as: "menu_id_reff_menus",
    through: role_menu,
    foreignKey: "role_id",
    otherKey: "menu_id",
  });
  wallet.belongsTo(coin, { as: "coin", foreignKey: "coin_id" });
  coin.hasMany(wallet, { as: "wallets", foreignKey: "coin_id" });
  withdrawal.belongsTo(coin, { as: "coin", foreignKey: "coin_id" });
  coin.hasMany(withdrawal, { as: "withdrawals", foreignKey: "coin_id" });
  bonus.belongsTo(member, { as: "member", foreignKey: "member_id" });
  member.hasMany(bonus, { as: "bonuses", foreignKey: "member_id" });
  orders.belongsTo(member, { as: "member", foreignKey: "member_id" });
  member.hasMany(orders, { as: "orders", foreignKey: "member_id" });
  member.belongsTo(ranking, { as: "ranking", foreignKey: "ranking_id" });
  bonus.belongsTo(orders, { as: "order", foreignKey: "order_id" });
  orders.hasMany(bonus, { as: "bonuses", foreignKey: "order_id" });
  orders.belongsTo(product, { as: "product", foreignKey: "product_id" });
  product.hasMany(orders, { as: "orders", foreignKey: "product_id" });
  ranking_req.belongsTo(ranking, { as: "ranking", foreignKey: "ranking_id" });
  ranking.hasMany(ranking_req, {
    as: "ranking_reqs",
    foreignKey: "ranking_id",
  });
  ranking_req.belongsTo(ranking, {
    as: "ranking_id_member_ranking",
    foreignKey: "ranking_id_member",
  });
  ranking.hasMany(ranking_req, {
    as: "ranking_id_member_ranking_reqs",
    foreignKey: "ranking_id_member",
  });
  bonus.belongsTo(reff_bonus_status, {
    as: "bonus_status",
    foreignKey: "bonus_status_id",
  });
  reff_bonus_status.hasMany(bonus, {
    as: "bonuses",
    foreignKey: "bonus_status_id",
  });
  coin.belongsTo(reff_chain, { as: "chain", foreignKey: "chain_id" });
  reff_chain.hasMany(coin, { as: "coins", foreignKey: "chain_id" });
  bonus.belongsTo(reff_curr, { as: "curr", foreignKey: "curr_id" });
  reff_curr.hasMany(bonus, { as: "bonuses", foreignKey: "curr_id" });
  coin.belongsTo(reff_curr, { as: "curr", foreignKey: "curr_id" });
  reff_curr.hasMany(coin, { as: "coins", foreignKey: "curr_id" });
  product.belongsTo(reff_curr, { as: "curr", foreignKey: "curr_id" });
  reff_curr.hasMany(product, { as: "products", foreignKey: "curr_id" });
  ranking_req.belongsTo(reff_curr, { as: "curr", foreignKey: "curr_id" });
  reff_curr.hasMany(ranking_req, { as: "ranking_reqs", foreignKey: "curr_id" });
  users_balance_trx.belongsTo(reff_curr, { as: "curr", foreignKey: "curr_id" });
  reff_curr.hasMany(users_balance_trx, {
    as: "users_balance_trxes",
    foreignKey: "curr_id",
  });
  role_menu.belongsTo(reff_menu, { as: "menu", foreignKey: "menu_id" });
  reff_menu.hasMany(role_menu, { as: "role_menus", foreignKey: "menu_id" });
  orders.belongsTo(reff_order_status, {
    as: "order_st",
    foreignKey: "order_sts_id",
  });
  reff_order_status.hasMany(orders, {
    as: "orders",
    foreignKey: "order_sts_id",
  });
  ranking_req.belongsTo(reff_ranking_req_type, {
    as: "ranking_req_type",
    foreignKey: "ranking_req_type_id",
  });
  reff_ranking_req_type.hasMany(ranking_req, {
    as: "ranking_reqs",
    foreignKey: "ranking_req_type_id",
  });
  member.belongsTo(reff_user_status, {
    as: "user_status",
    foreignKey: "user_status_id",
  });
  reff_user_status.hasMany(member, {
    as: "members",
    foreignKey: "user_status_id",
  });
  wallet.belongsTo(reff_wallet_type, {
    as: "wallet_type",
    foreignKey: "wallet_type_id",
  });
  reff_wallet_type.hasMany(wallet, {
    as: "wallets",
    foreignKey: "wallet_type_id",
  });
  member.belongsTo(roles, { as: "role", foreignKey: "role_id" });
  roles.hasMany(member, { as: "members", foreignKey: "role_id" });
  role_menu.belongsTo(roles, { as: "role", foreignKey: "role_id" });
  roles.hasMany(role_menu, { as: "role_menus", foreignKey: "role_id" });
  withdrawal.belongsTo(users, {
    as: "user_id_admin_user",
    foreignKey: "user_id_admin",
  });
  users.hasMany(withdrawal, { as: "withdrawals", foreignKey: "user_id_admin" });

  // Define self-referential association
  member.belongsTo(member, { as: "parent", foreignKey: "member_id_parent" });
  member.hasMany(member, { as: "children", foreignKey: "member_id_parent" });

  return {
    audits,
    bonus,
    coin,
    member,
    orders,
    person,
    product,
    ranking,
    ranking_req,
    reff_bonus_status,
    reff_chain,
    reff_curr,
    reff_menu,
    reff_order_status,
    reff_ranking_req_type,
    reff_user_status,
    reff_wallet_type,
    reff_withdrawal_status,
    role_menu,
    roles,
    users,
    users_balance,
    users_balance_trx,
    wallet,
    withdrawal,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
