const db = require("../utils/db");

const create = async ({
  business_id,
  customer_id,
  amount,
  payment_date,
  sinpe_reference,
  sender_name,
  sender_phone,
  image_url,
  payment_period_month = null,
  payment_period_year = null,
  is_duplicate_flag = false,
  amount_mismatch_flag = false,
  status = "confirmed",
}) => {
  const result = await db.callProcedure("create_payment", [
    business_id,
    customer_id,
    amount,
    payment_date,
    sinpe_reference,
    sender_name,
    sender_phone,
    image_url,
    payment_period_month,
    payment_period_year,
    is_duplicate_flag,
    amount_mismatch_flag,
    status,
  ]);

  return result.rows[0];
};

const findByBusinessId = async (business_id) => {
  const result = await db.query(
    `SELECT p.*, c.full_name as customer_name, c.phone as customer_phone
     FROM payments p
     LEFT JOIN customers c ON p.customer_id = c.id
     WHERE p.business_id = $1
     ORDER BY p.payment_date DESC`,
    [business_id],
  );

  return result.rows;
};

const findById = async (id) => {
  const result = await db.query(
    `SELECT p.*, c.full_name as customer_name, c.phone as customer_phone
     FROM payments p
     LEFT JOIN customers c ON p.customer_id = c.id
     WHERE p.id = $1`,
    [id],
  );

  return result.rows[0];
};

const findByCustomerId = async (customer_id) => {
  const result = await db.query("SELECT * FROM payments WHERE customer_id = $1 ORDER BY payment_date DESC", [
    customer_id,
  ]);

  return result.rows;
};

const findBySinpeReference = async (business_id, sinpe_reference) => {
  const result = await db.query("SELECT * FROM payments WHERE business_id = $1 AND sinpe_reference = $2", [
    business_id,
    sinpe_reference,
  ]);

  return result.rows[0];
};

const updateStatus = async (id, status) => {
  const result = await db.callProcedure("update_payment_status", [id, status]);

  return result.rows[0];
};

module.exports = {
  create,
  findByBusinessId,
  findById,
  findByCustomerId,
  findBySinpeReference,
  updateStatus,
};
