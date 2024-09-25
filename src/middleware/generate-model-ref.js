const REF_MODEL = {
  "user-status": "reff_user_status",
  "wallet-type": "reff_wallet_type",
  "ranking-req": "reff_ranking_req_type",
  "withdrawal-status": "reff_withdrawal_status",
  "bonus-status": "reff_bonus_status",
  "currency": "reff_curr",
};

const generateModel = (req, res, next) => {
  const { id, ref_name } = req.params;
  const modelName = REF_MODEL[ref_name];
  req.params.model_name = modelName;
  next();
};

module.exports = generateModel;
