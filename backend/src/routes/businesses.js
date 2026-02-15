const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");
const { authenticate } = require("../middleware/auth");
const { verifyBusinessOwner } = require("../middleware/businessAccess");

router.use(authenticate);
router.post("/", businessController.createBusiness);
router.get("/", businessController.getUserBusinesses);
router.get("/:businessId", verifyBusinessOwner, businessController.getBusinessById);
router.put("/:businessId", verifyBusinessOwner, businessController.updateBusiness);
router.delete("/:businessId", verifyBusinessOwner, businessController.deleteBusiness);

module.exports = router;
