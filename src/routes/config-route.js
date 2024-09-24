const express = require("express");

const rankingController = require("../controllers/config/ranking-controller");
const productController = require("../controllers/config/product-controller");
const walletController = require("../controllers/config/wallet-controller");

const validateRequest = require("../middleware/validate-request");
const { levelSchema } = require("../validation/ranking-validation");
const { productSchema } = require("../validation/product-validation");
const { walletSchema } = require("../validation/wallet-validation");

const router = express.Router();

// LEVEL
router.get("/level", rankingController.getLevel);
router.get("/level/:rankingId", rankingController.getLevelByRankingId);
router.put(
  "/level/:levelId",
  validateRequest(levelSchema),
  rankingController.updateLevel
);
router.post(
  "/level",
  validateRequest(levelSchema),
  rankingController.createLevel
);
router.delete("/level/:levelId", rankingController.deleteLevel);

// PRODUCT
router.get("/product", productController.getProducts);
router.get("/product/:productId", productController.getProductById);
router.put(
  "/product/:productId",
  validateRequest(productSchema),
  productController.updateProduct
);
router.post(
  "/product",
  validateRequest(productSchema),
  productController.storeProduct
);
router.delete("/product/:productId", productController.deleteProduct);
module.exports = router;

// ADDRESS
router.get("/wallet", walletController.getWallets);
router.get("/wallet/admin", walletController.getWalletAdmin);
router.get("/wallet/:walletId", walletController.getWalletById);
router.delete("/wallet/:walletId", walletController.deleteWalletById);
router.post(
  "/wallet",
  validateRequest(walletSchema),
  walletController.storeWalletAdmin
);
router.put(
  "/wallet/:walletId",
  validateRequest(walletSchema),
  walletController.updateWalletById
);
