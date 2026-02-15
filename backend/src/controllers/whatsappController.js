const Business = require("../models/Business");
const Customer = require("../models/Customer");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const { extractPaymentData } = require("../services/paymentExtractor");
const { sendErrorMessage } = require("../services/whatsappService");

const handleIncomingMessage = async (req, res) => {
  try {
    console.log("=== WEBHOOK RECEIVED ===");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("Query:", req.query);
    console.log("========================");
    const { From, MediaUrl0, Body } = req.body;

    // Extract phone number (remove 'whatsapp:' prefix)
    const senderPhone = From.replace("whatsapp:", "");

    // Check if message contains an image
    if (!MediaUrl0) {
      console.log("No image attached, ignoring message");
      return res.status(200).send("OK");
    }

    // Find business by WhatsApp number - we need to get the recipient's number
    // In Twilio, the To field contains the business WhatsApp number
    const businessWhatsApp = req.body.To.replace("whatsapp:", "");
    const business = await Business.findByWhatsAppNumber(businessWhatsApp);

    if (!business) {
      console.log("Business not found for WhatsApp number:", businessWhatsApp);
      return res.status(200).send("OK");
    }

    console.log("Processing payment from:", senderPhone, "for business:", business.business_name);

    // Extract payment data from image using Claude
    let paymentData;
    try {
      paymentData = await extractPaymentData(MediaUrl0);
    } catch (error) {
      console.error("Failed to extract payment data:", error);
      await sendErrorMessage(senderPhone, "processing_error");
      return res.status(200).send("OK");
    }

    // Check for duplicate SINPE reference
    const duplicate = await Payment.findBySinpeReference(business.id, paymentData.sinpe_reference);
    if (duplicate) {
      console.log("Duplicate payment detected:", paymentData.sinpe_reference);

      // Create payment record with duplicate flag
      await Payment.create({
        business_id: business.id,
        customer_id: null,
        amount: paymentData.amount,
        payment_date: paymentData.payment_date,
        sinpe_reference: paymentData.sinpe_reference,
        sender_name: paymentData.sender_name,
        sender_phone: paymentData.sender_phone,
        image_url: MediaUrl0,
        is_duplicate_flag: true,
        status: "pending",
      });

      // Create notification
      await Notification.create({
        business_id: business.id,
        payment_id: null,
        notification_type: "duplicate_payment",
        message: `Pago duplicado detectado. Referencia SINPE: ${paymentData.sinpe_reference}, Monto: ₡${paymentData.amount}`,
      });

      // Send error message to sender
      await sendErrorMessage(senderPhone, "duplicate_payment");

      return res.status(200).send("OK");
    }

    // Find or create customer
    let customer = await Customer.findByPhone(business.id, paymentData.sender_phone);

    if (!customer) {
      console.log("Creating new customer:", paymentData.sender_phone);

      // Validate we have the phone number
      if (!paymentData.sender_phone) {
        console.error("Cannot create customer: phone number is null");
        await sendErrorMessage(senderPhone, "processing_error");
        return res.status(200).send("OK");
      }

      customer = await Customer.create({
        business_id: business.id,
        phone: paymentData.sender_phone,
        full_name: paymentData.sender_name || "Unknown",
        is_verified: false,
      });

      // Create notification for new customer
      await Notification.create({
        business_id: business.id,
        payment_id: null,
        notification_type: "new_customer",
        message: `Nuevo cliente creado: ${paymentData.sender_name} (${paymentData.sender_phone})`,
      });
    }

    // Check amount mismatch for membership businesses
    let amountMismatch = false;
    if (business.business_type === "membership" && customer.monthly_fee) {
      if (parseFloat(paymentData.amount) !== parseFloat(customer.monthly_fee)) {
        amountMismatch = true;
        console.log("Amount mismatch detected:", paymentData.amount, "vs", customer.monthly_fee);
      }
    }

    // Calculate payment period for membership
    let payment_period_month = null;
    let payment_period_year = null;
    if (business.business_type === "membership") {
      const date = new Date(paymentData.payment_date);
      payment_period_month = date.getMonth() + 1;
      payment_period_year = date.getFullYear();
    }

    // Create payment record
    const payment = await Payment.create({
      business_id: business.id,
      customer_id: customer.id,
      amount: paymentData.amount,
      payment_date: paymentData.payment_date,
      sinpe_reference: paymentData.sinpe_reference,
      sender_name: paymentData.sender_name,
      sender_phone: paymentData.sender_phone,
      image_url: MediaUrl0,
      payment_period_month,
      payment_period_year,
      is_duplicate_flag: false,
      amount_mismatch_flag: amountMismatch,
      status: "confirmed",
    });

    console.log("Payment created:", payment.id);

    // Update customer metrics
    if (business.business_type === "product_sales") {
      await Customer.updateMetrics(customer.id, {
        total_purchases: customer.total_purchases + 1,
        total_spent: parseFloat(customer.total_spent) + parseFloat(paymentData.amount),
        last_purchase_date: paymentData.payment_date,
      });
    } else if (business.business_type === "membership") {
      const paymentDay = new Date(paymentData.payment_date).getDate();
      const dueDay = customer.payment_due_day || 1;
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

      const notification = await Notification.create({
        business_id: business.id,
        payment_id: payment.id,
        notification_type: "payment_received",
        message: `Pago recibido: ${customer.full_name} - ₡${paymentData.amount} (${isOnTime ? "A tiempo" : "Tardío"})`,
      });
      console.log("Notification created:", notification);
    }

    // Send error message only if amount mismatch
    if (amountMismatch) {
      await Notification.create({
        business_id: business.id,
        payment_id: payment.id,
        notification_type: "amount_mismatch",
        message: `Monto incorrecto: ${paymentData.sender_name} pagó ₡${paymentData.amount}, se esperaba ₡${customer.monthly_fee}`,
      });

      await sendErrorMessage(senderPhone, "amount_mismatch", {
        amount: paymentData.amount,
        monthly_fee: customer.monthly_fee,
      });
    }
    console.log("Payment processed successfully, no response sent");

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).send("Error processing webhook");
  }
};

const verifyWebhook = (req, res) => {
  // This is for initial webhook verification
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send("Verification failed");
  }
};

module.exports = {
  handleIncomingMessage,
  verifyWebhook,
};
