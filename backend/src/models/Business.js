const db = require("../utils/db");

const create = async ({ user_id, business_name, business_type, whatsapp_number }) => {
  const result = await db.callProcedure("create_business", [user_id, business_name, business_type, whatsapp_number]);
  return result.rows[0];
};

const findByUserId = async (user_id) => {
  const result = await db.query("SELECT * FROM businesses WHERE user_id = $1 ORDER BY created_at DESC", [user_id]);
  return result.rows;
};

const findById = async (id) => {
  const result = await db.query("SELECT * FROM businesses WHERE id = $1", [id]);
  return result.rows[0];
};

const update = async (id, { business_name, business_type, whatsapp_number }) => {
  const result = await db.callProcedure("update_business", [id, business_name, business_type, whatsapp_number]);
  return result.rows[0];
};

const deleteBusiness = async (id) => {
  const result = await db.callProcedure("delete_business", [id]);
  return result.rows[0];
};

const findByWhatsAppNumber = async (whatsapp_number) => {
  const result = await db.query("SELECT * FROM businesses WHERE whatsapp_number = $1", [whatsapp_number]);
  return result.rows[0];
};

module.exports = {
  create,
  findByUserId,
  findById,
  update,
  deleteBusiness,
  findByWhatsAppNumber,
};
