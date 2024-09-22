const exporess = require("express");

const referensiController = require("../controllers/referensi-controller");
const generateModel = require("../middleware/generate-model-ref");

const router = exporess.Router();
router.get("/:ref_name", generateModel, referensiController.getAll);
router.get("/:ref_name/:id", generateModel, referensiController.getById);
router.post("/:ref_name", generateModel, referensiController.store);

module.exports = router;
