const REF_MODEL = {
  "user-status": "reff_user_status",
  "ranking-req": "reff_ranking_req_type",
};

const generateModel = (req, res, next) => {
  const { id, ref_name } = req.params;
  const modelName = REF_MODEL[ref_name];
  req.params.model_name = modelName;
  next();
};

module.exports = generateModel;
