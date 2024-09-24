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
  return Response.Success(res, null, "Data berhasil disimpan");
});

const storeProduct = tryCatch(async (req, res) => {
  const data = req.body;
  await productService.storeProduct(data);
  return Response.Success(res, null, "Data berhasil disimpan");
});

const deleteProduct = tryCatch(async (req, res) => {
  const { productId } = req.params;
  await productService.deleteProductById(productId);
  return Response.Success(res, null, "Data berhasil dihapus");
});

module.exports = {
  getProducts,
  getProductById,
  updateProduct,
  storeProduct,
  deleteProduct,
};
