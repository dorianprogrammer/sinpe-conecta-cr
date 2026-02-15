const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middleware/auth");
const { verifyBusinessOwner } = require("../middleware/businessAccess");

router.use(authenticate);

router.post("/manual", paymentController.createManualPayment);
router.post("/from-image", paymentController.createPaymentFromImage);
router.get("/business/:businessId", verifyBusinessOwner, paymentController.getBusinessPayments);
router.get("/:paymentId", paymentController.getPaymentById);
router.put("/:paymentId/status", paymentController.updatePaymentStatus);

module.exports = router;
