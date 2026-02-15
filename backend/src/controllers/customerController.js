const Customer = require("../models/Customer");
const Business = require("../models/Business");

const createCustomer = async (req, res) => {
  try {
    const { business_id, phone, full_name, payment_due_day, monthly_fee, membership_start_date } = req.body;

    // Verify business exists and user owns it
    const business = await Business.findById(business_id);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    if (business.user_id !== req.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if customer already exists
    const existing = await Customer.findByPhone(business_id, phone);
    if (existing) {
      return res.status(400).json({ error: "Customer already exists with this phone number" });
    }

    // Validate membership fields if business type is membership
    if (business.business_type === "membership") {
      if (!payment_due_day || !monthly_fee || !membership_start_date) {
        return res.status(400).json({
          error: "payment_due_day, monthly_fee, and membership_start_date are required for membership businesses",
        });
      }
    }

    const customer = await Customer.create({
      business_id,
      phone,
      full_name,
      is_verified: true,
      payment_due_day,
      monthly_fee,
      membership_start_date,
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error("Create customer error:", error);
    res.status(500).json({ error: "Failed to create customer" });
  }
};

const getBusinessCustomers = async (req, res) => {
  try {
    const { businessId } = req.params;

    const customers = await Customer.findByBusinessId(businessId);
    res.json(customers);
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Verify user owns the business
    const business = await Business.findById(customer.business_id);
    if (business.user_id !== req.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(customer);
  } catch (error) {
    console.error("Get customer error:", error);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { full_name, is_verified, payment_due_day, monthly_fee } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Verify user owns the business
    const business = await Business.findById(customer.business_id);
    if (business.user_id !== req.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updated = await Customer.update(customerId, {
      full_name,
      is_verified,
      payment_due_day,
      monthly_fee,
    });

    res.json(updated);
  } catch (error) {
    console.error("Update customer error:", error);
    res.status(500).json({ error: "Failed to update customer" });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Verify user owns the business
    const business = await Business.findById(customer.business_id);
    if (business.user_id !== req.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await Customer.deleteCustomer(customerId);
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({ error: "Failed to delete customer" });
  }
};

module.exports = {
  createCustomer,
  getBusinessCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
