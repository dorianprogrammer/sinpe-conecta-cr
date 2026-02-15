const express = require("express");
const router = express.Router();
const whatsappController = require("../controllers/whatsappController");

// Webhook verification (GET) - Twilio/Meta uses this to verify the endpoint
router.get("/", whatsappController.verifyWebhook);

// Incoming WhatsApp messages (POST)
router.post("/", whatsappController.handleIncomingMessage);

module.exports = router;
