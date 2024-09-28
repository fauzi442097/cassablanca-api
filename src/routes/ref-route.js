const express = require("express");

const referensiController = require("../controllers/referensi-controller");
const generateModel = require("../middleware/generate-model-ref");
const validateRef = require("../middleware/validate-ref");

const router = express.Router();
router.get("/:ref_name", generateModel, referensiController.getAll);
router.get("/:ref_name/:id", generateModel, referensiController.getById);
router.delete("/:ref_name/:id", generateModel, referensiController.deleteById);
router.post(
  "/:ref_name",
  generateModel,
  validateRef,
  referensiController.store
);
router.put(
  "/:ref_name/:id",
  generateModel,
  validateRef,
  referensiController.update
);

module.exports = router;
