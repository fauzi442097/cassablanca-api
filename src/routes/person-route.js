const express = require("express");

const personController = require("../controllers/person-controller");

const router = express.Router();
router.get("/", personController.index);
router.get("/:personId", personController.getById);

// router.get("/:customerId", validateCustomerId, customer_controller.getById);
// router.post("/", validateCustomer, customer_controller.store);
// router.put("/", validateCustomer, customer_controller.update);
// router.delete(
//   "/:customerId",
//   validateCustomerId,
//   customer_controller.deleteCust
// );

module.exports = router;
