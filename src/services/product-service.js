const productRepository = require("../repositories/product-repository");
const { withTransaction } = require("../utils/helper");
const ResponseError = require("../utils/response-error");

const auditService = require("../services/audit-service");
const db = require("../config/database");
const initModels = require("../models/init-models");

const { product, reff_curr } = initModels(db);

const getAllProducts = async () => {
  return await productRepository.getAll();
};

const getProductById = async (productId) => {
  const product = await productRepository.getDataById(productId);
  if (!product) throw new ResponseError("Data not found", 404);
  return product;
};

const updateProduct = async (productId, data) => {
  const productExisting = await productRepository.getDataById(productId);
  if (!productExisting) throw new ResponseError("Data not found", 404);

  const total = data.sharing_pct_usdt + data.sharing_pct_product;
  if (total != 100)
    throw new ResponseError(
      "The sum of the percentages sharing usdt and sharing product must be 100",
      404
    );

  const ProductDTO = { ...data, price: data.price };
  return withTransaction(async (transaction) => {
    const productCreated = await productRepository.update(
      productId,
      ProductDTO,
      transaction
    );

    const AuditDTO = {
      event: `Update produk'`,
      model_id: productExisting.id,
      model_name: product.tableName,
      old_values: productExisting,
      new_values: productCreated,
    };

    await auditService.store(AuditDTO, transaction);
  });
};

const storeProduct = async (data) => {
  const currency = await reff_curr.findByPk(data.curr_id);
  if (!currency)
    throw new ResponseError(
      `Currency '${data.curr_id}' is not recognized`,
      401
    );

  const dataExisting = await productRepository.getDataByCurrId(data.curr_id);
  if (dataExisting) throw new ResponseError(`Data already exists`, 401);

  const total = data.sharing_pct_usdt + data.sharing_pct_product;
  if (total != 100)
    throw new ResponseError(
      "The sum of the percentages sharing usdt and sharing product must be 100",
      404
    );

  const ProductDTO = { ...data, price: data.price };
  return withTransaction(async (transaction) => {
    const dataCreated = await productRepository.store(ProductDTO, transaction);
    const AuditDTO = {
      event: `Create product`,
      model_id: dataCreated.id,
      model_name: product.tableName,
      new_values: dataCreated,
    };
    await auditService.store(AuditDTO, transaction);
  });
};

const deleteProductById = async (productId) => {
  const productExisting = await productRepository.getDataById(productId);
  if (!productExisting) throw new ResponseError("Data not found", 404);

  return withTransaction(async (transaction) => {
    await productRepository.deleteById(productId, transaction);

    const AuditDTO = {
      event: `Delete product`,
      model_id: productExisting.id,
      model_name: product.tableName,
      old_values: productExisting,
    };

    await auditService.store(AuditDTO, transaction);
  });
};

module.exports = {
  getAllProducts,
  getProductById,
  updateProduct,
  storeProduct,
  deleteProductById,
};
