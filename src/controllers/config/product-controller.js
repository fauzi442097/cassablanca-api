const Response = require("../../utils/response-handler");
const productService = require("../../services/product-service");
const { tryCatch } = require("../../utils/helper");

const getProducts = async (req, res) => {
  const data = await productService.getAllProducts();
  return Response.Success(res, data);
};

const getProductById = async (req, res) => {
  const { productId } = req.params;
  const data = await productService.getProductById(productId);
  return Response.Success(res, data);
};

const updateProduct = tryCatch(async (req, res) => {
  const { productId } = req.params;
  const data = req.body;
  await productService.updateProduct(productId, data);
  return Response.Success(res, null, "Data has been saved successfully");
});

const storeProduct = tryCatch(async (req, res) => {
  const data = req.body;
  await productService.storeProduct(data);
  return Response.Success(res, null, "Data has been saved successfully");
});

const deleteProduct = tryCatch(async (req, res) => {
  const { productId } = req.params;
  await productService.deleteProductById(productId);
  return Response.Success(res, null, "Data has been deleted successfully");
});

module.exports = {
  getProducts,
  getProductById,
  updateProduct,
  storeProduct,
  deleteProduct,
};
