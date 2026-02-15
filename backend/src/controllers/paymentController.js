const Payment = require("../models/Payment");
const Customer = require("../models/Customer");
const Business = require("../models/Business");
const { extractPaymentData } = require("../services/paymentExtractor");

const createManualPayment = async (req, res) => {
  try {
    const { business_id, customer_id, amount, payment_date, sinpe_reference, sender_name, sender_phone } = req.body;

    // Verify business exists and user owns it
    const business = await Business.findById(business_id);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    if (business.user_id !== req.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check for duplicate SINPE reference
    if (sinpe_reference) {
      const duplicate = await Payment.findBySinpeReference(business_id, sinpe_reference);
      if (duplicate) {
        return res.status(400).json({ error: "Payment with this SINPE reference already exists" });
      }
    }

    // Verify customer belongs to business
    if (customer_id) {
      const customer = await Customer.findById(customer_id);
      if (!customer || customer.business_id !== business_id) {
        return res.status(400).json({ error: "Invalid customer for this business" });
      }
    }

    // Calculate payment period for membership
    let payment_period_month = null;
    let payment_period_year = null;
    if (business.business_type === "membership") {
      const date = new Date(payment_date);
      payment_period_month = date.getMonth() + 1;
      payment_period_year = date.getFullYear();
    }

    const payment = await Payment.create({
      business_id,
      customer_id,
      amount,
      payment_date,
      sinpe_reference,
      sender_name,
      sender_phone,
      image_url: null,
      payment_period_month,
      payment_period_year,
      is_duplicate_flag: false,
      amount_mismatch_flag: false,
      status: "confirmed",
    });

    // Update customer metrics if customer exists
    if (customer_id) {
      const customer = await Customer.findById(customer_id);

      if (business.business_type === "product_sales") {
        await Customer.updateMetrics(customer_id, {
          total_purchases: customer.total_purchases + 1,
          total_spent: parseFloat(customer.total_spent) + parseFloat(amount),
          last_purchase_date: payment_date,
        });
      } else if (business.business_type === "membership") {
        // Check if payment is on time (within grace period)
        const paymentDay = new Date(payment_date).getDate();
        const dueDay = customer.payment_due_day;
        const isOnTime = paymentDay <= dueDay + 5;

        if (isOnTime) {
          await Customer.updateMetrics(customer_id, {
            on_time_payment_count: customer.on_time_payment_count + 1,
          });
        } else {
          await Customer.updateMetrics(customer_id, {
            late_payment_count: customer.late_payment_count + 1,
          });
        }
      }
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ error: "Failed to create payment" });
  }
};

const createPaymentFromImage = async (req, res) => {
  try {
    const { business_id, image_url } = req.body;

    // Verify business exists and user owns it
    const business = await Business.findById(business_id);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    if (business.user_id !== req.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Extract payment data using Claude
    const paymentData = await extractPaymentData(image_url);

    // Check for duplicate SINPE reference
    const duplicate = await Payment.findBySinpeReference(business_id, paymentData.sinpe_reference);
    if (duplicate) {
      return res.status(400).json({
        error: "Duplicate payment detected",
        payment_data: paymentData,
      });
    }

    // Find or create customer
    let customer = await Customer.findByPhone(business_id, paymentData.sender_phone);

    if (!customer) {
      // Create new unverified customer
      customer = await Customer.create({
        business_id,
        phone: paymentData.sender_phone,
        full_name: paymentData.sender_name,
        is_verified: false,
      });
    }

    // Calculate payment period for membership
    let payment_period_month = null;
    let payment_period_year = null;
    let amount_mismatch_flag = false;

    if (business.business_type === "membership") {
      const date = new Date(paymentData.payment_date);
      payment_period_month = date.getMonth() + 1;
      payment_period_year = date.getFullYear();

      // Check amount mismatch
      if (customer.monthly_fee && parseFloat(paymentData.amount) !== parseFloat(customer.monthly_fee)) {
        amount_mismatch_flag = true;
      }
    }

    // Create payment
    const payment = await Payment.create({
      business_id,
      customer_id: customer.id,
      amount: paymentData.amount,
      payment_date: paymentData.payment_date,
      sinpe_reference: paymentData.sinpe_reference,
      sender_name: paymentData.sender_name,
      sender_phone: paymentData.sender_phone,
      image_url,
      payment_period_month,
      payment_period_year,
      is_duplicate_flag: false,
      amount_mismatch_flag,
      status: "confirmed",
    });

    // Update customer metrics
    if (business.business_type === "product_sales") {
      await Customer.updateMetrics(customer.id, {
        total_purchases: customer.total_purchases + 1,
        total_spent: parseFloat(customer.total_spent) + parseFloat(paymentData.amount),
        last_purchase_date: paymentData.payment_date,
      });
    } else if (business.business_type === "membership") {
      const paymentDay = new Date(paymentData.payment_date).getDate();
      const dueDay = customer.payment_due_day;
      const isOnTime = paymentDay <= dueDay + 5;

      if (isOnTime) {
        await Customer.updateMetrics(customer.id, {
          on_time_payment_count: customer.on_time_payment_count + 1,
        });
      } else {
        await Customer.updateMetrics(customer.id, {
          late_payment_count: customer.late_payment_count + 1,
        });
      }
    }

    res.status(201).json({
      payment,
      customer_created: !customer.is_verified,
      amount_mismatch: amount_mismatch_flag,
    });
  } catch (error) {
    console.error("Create payment from image error:", error);
    res.status(500).json({ error: error.message || "Failed to process payment image" });
  }
};

const getBusinessPayments = async (req, res) => {
  try {
    const { businessId } = req.params;

    const payments = await Payment.findByBusinessId(businessId);
    res.json(payments);
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Verify user owns the business
    const business = await Business.findById(payment.business_id);
    if (business.user_id !== req.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;

    if (!["confirmed", "pending", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Verify user owns the business
    const business = await Business.findById(payment.business_id);
    if (business.user_id !== req.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updated = await Payment.updateStatus(paymentId, status);
    res.json(updated);
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({ error: "Failed to update payment status" });
  }
};

module.exports = {
  createManualPayment,
  createPaymentFromImage,
  getBusinessPayments,
  getPaymentById,
  updatePaymentStatus,
};
