const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const { authenticate } = require("../middleware/auth");
const { verifyBusinessOwner } = require("../middleware/businessAccess");

router.use(authenticate);

router.post("/", customerController.createCustomer);
router.get("/business/:businessId", verifyBusinessOwner, customerController.getBusinessCustomers);
router.get("/:customerId", customerController.getCustomerById);
router.put("/:customerId", customerController.updateCustomer);
router.delete("/:customerId", customerController.deleteCustomer);

module.exports = router;
