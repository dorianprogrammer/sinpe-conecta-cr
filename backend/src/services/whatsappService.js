const twilioClient = require("../config/whatsapp");

const sendMessage = async (to, message) => {
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
    });

    console.log("WhatsApp message sent:", result.sid);
    return result;
  } catch (error) {
    console.error("WhatsApp send error:", error);
    throw error;
  }
};

const sendErrorMessage = (to, errorType, data = {}) => {
  let message = "";

  switch (errorType) {
    case "duplicate_payment":
      message = "Este pago ya fue registrado. Por favor contacte al negocio.";
      break;

    case "amount_mismatch":
      message = `El monto recibido (₡${data.amount}) no coincide con su cuota mensual (₡${data.monthly_fee}). Por favor contacte al negocio.`;
      break;

    case "processing_error":
      message = "No pudimos procesar su pago. Por favor contacte al negocio.";
      break;

    default:
      message = "Hubo un problema procesando su pago. Por favor contacte al negocio.";
  }

  return sendMessage(to, message);
};

module.exports = {
  sendMessage,
  sendErrorMessage,
};
