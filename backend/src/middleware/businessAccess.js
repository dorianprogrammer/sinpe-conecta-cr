const Business = require("../models/Business");

const verifyBusinessOwner = async (req, res, next) => {
  try {
    const businessId = req.params.businessId || req.body.business_id;
    if (!businessId) {
      return res.status(400).json({ error: "Business ID required" });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    if (business.user_id !== req.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    req.business = business;
    next();
  } catch (error) {
    console.error("Business access error:", error);
    res.status(500).json({ error: "Authorization failed" });
  }
};

module.exports = { verifyBusinessOwner };
