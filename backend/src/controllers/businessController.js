const Business = require("../models/Business");

const createBusiness = async (req, res) => {
  try {
    const { business_name, business_type, whatsapp_number } = req.body;

    // Validate business type
    if (!["product_sales", "membership"].includes(business_type)) {
      return res.status(400).json({
        error: "Invalid business type. Must be product_sales or membership",
      });
    }

    // Check if WhatsApp number already exists
    const existing = await Business.findByWhatsAppNumber(whatsapp_number);
    if (existing) {
      return res.status(400).json({
        error: "WhatsApp number already registered",
      });
    }

    const business = await Business.create({
      user_id: req.userId,
      business_name,
      business_type,
      whatsapp_number,
    });

    res.status(201).json(business);
  } catch (error) {
    console.error("Create business error:", error);
    res.status(500).json({ error: "Failed to create business" });
  }
};

const getUserBusinesses = async (req, res) => {
  try {
    const businesses = await Business.findByUserId(req.userId);
    res.json(businesses);
  } catch (error) {
    console.error("Get businesses error:", error);
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
};

const getBusinessById = async (req, res) => {
  try {
    res.json(req.business);
  } catch (error) {
    console.error("Get business error:", error);
    res.status(500).json({ error: "Failed to fetch business" });
  }
};

const updateBusiness = async (req, res) => {
  try {
    const { business_name, business_type, whatsapp_number } = req.body;

    // Validate business type
    if (business_type && !["product_sales", "membership"].includes(business_type)) {
      return res.status(400).json({
        error: "Invalid business type. Must be product_sales or membership",
      });
    }

    // Check if WhatsApp number is taken by another business
    if (whatsapp_number) {
      const existing = await Business.findByWhatsAppNumber(whatsapp_number);
      if (existing && existing.id !== req.business.id) {
        return res.status(400).json({
          error: "WhatsApp number already registered",
        });
      }
    }

    const updated = await Business.update(req.params.businessId, {
      business_name: business_name || req.business.business_name,
      business_type: business_type || req.business.business_type,
      whatsapp_number: whatsapp_number || req.business.whatsapp_number,
    });

    res.json(updated);
  } catch (error) {
    console.error("Update business error:", error);
    res.status(500).json({ error: "Failed to update business" });
  }
};

const deleteBusiness = async (req, res) => {
  try {
    await Business.deleteBusiness(req.params.businessId);
    res.json({ message: "Business deleted successfully" });
  } catch (error) {
    console.error("Delete business error:", error);
    res.status(500).json({ error: "Failed to delete business" });
  }
};

module.exports = {
  createBusiness,
  getUserBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
};
