const User = require("../models/User");
const Business = require("../models/Business");
const { query } = require("../utils/db");

// ─── Users ────────────────────────────────────────────────────────────────────

const listUsers = async (req, res) => {
  try {
    const result = await query(
      "SELECT id, email, full_name, phone, role, created_at FROM users ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("listUsers error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, full_name, phone, role = "user" } = req.body;

    if (!["user", "superuser", "readonly_admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = await User.create({ email, password, full_name, phone, role });
    res.status(201).json(user);
  } catch (error) {
    console.error("createUser error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// ─── Businesses ───────────────────────────────────────────────────────────────

const listAllBusinesses = async (req, res) => {
  try {
    const result = await query(`
      SELECT b.*, u.full_name AS owner_name, u.email AS owner_email
      FROM businesses b
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("listAllBusinesses error:", error);
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
};

const createBusinessForUser = async (req, res) => {
  try {
    const { user_id, business_name, business_type, whatsapp_number } = req.body;

    if (!["product_sales", "membership"].includes(business_type)) {
      return res.status(400).json({ error: "Invalid business type" });
    }

    const existing = await Business.findByWhatsAppNumber(whatsapp_number);
    if (existing) {
      return res.status(400).json({ error: "WhatsApp number already registered" });
    }

    const business = await Business.create({ user_id, business_name, business_type, whatsapp_number });
    res.status(201).json(business);
  } catch (error) {
    console.error("createBusinessForUser error:", error);
    res.status(500).json({ error: "Failed to create business" });
  }
};

const assignBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    const result = await query("UPDATE businesses SET user_id = $1 WHERE id = $2 RETURNING *", [user_id, id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("assignBusiness error:", error);
    res.status(500).json({ error: "Failed to assign business" });
  }
};

module.exports = {
  listUsers,
  createUser,
  listAllBusinesses,
  createBusinessForUser,
  assignBusiness,
};
