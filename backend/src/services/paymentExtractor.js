const anthropic = require("../config/claude");
const axios = require("axios");

const downloadImage = async (url) => {
  // Twilio URLs need authentication
  const auth = {
    username: process.env.TWILIO_ACCOUNT_SID,
    password: process.env.TWILIO_AUTH_TOKEN,
  };

  const response = await axios.get(url, {
    auth,
    responseType: "arraybuffer",
  });

  return Buffer.from(response.data).toString("base64");
};

const extractPaymentData = async (imageUrl) => {
  try {
    // Download image and convert to base64
    const imageBase64 = await downloadImage(imageUrl);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `Extract payment information from this Costa Rican SINPE mobile transfer receipt (Comprobante de Transferencia SINPE Móvil).

Look for these fields:
- Monto transferido or Monto debitado: The transfer amount
- Cuenta origen or SINPE Móvil destino: The sender's name and phone number (format: NAME followed by phone like "8674-1687")
- Referencia or Documento: The transaction reference number
- Date at top right (format: "01 de febrero, 2026 14:10")

Return ONLY a JSON object:
{
  "amount": number (extract from "Monto transferido", remove ₡ and commas, example: 3000.00),
  "sender_name": string (extract from "Cuenta origen" line, the name part),
  "sender_phone": string (extract the phone number, add +506 prefix if only 8 digits, example: "+50686741687"),
  "sinpe_reference": string (the full Referencia number),
  "payment_date": string (convert to ISO 8601 format like "2026-02-01T14:10:00Z")
}

Important:
- For phone numbers with format "8674-1687", remove dashes and add +506 prefix to get "+50686741687"
- Amount should be a number without ₡ symbol or commas
- Do not include any explanation, only the JSON.`,
            },
          ],
        },
      ],
    });

    const responseText = message.content[0].text;
    console.log("Claude response:", responseText);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Could not extract JSON from Claude response");
    }

    const paymentData = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!paymentData.amount || !paymentData.sinpe_reference) {
      throw new Error("Missing required payment fields: amount or sinpe_reference");
    }

    if (!paymentData.sender_phone) {
      throw new Error("Missing required field: sender_phone");
    }

    console.log("Extracted payment data:", paymentData);

    return paymentData;
  } catch (error) {
    console.error("Payment extraction error:", error);
    throw new Error("Failed to extract payment data from image");
  }
};

module.exports = {
  extractPaymentData,
};
