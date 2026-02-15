const db = require("../utils/db");

const create = async ({
  business_id,
  phone,
  full_name,
  is_verified = false,
  payment_due_day = null,
  monthly_fee = null,
  membership_start_date = null,
}) => {
  const result = await db.callProcedure("create_customer", [
    business_id,
    phone,
    full_name,
    is_verified,
    payment_due_day,
    monthly_fee,
    membership_start_date,
  ]);

  return result.rows[0];
};

const findByBusinessId = async (business_id) => {
  const result = await db.query(
    `SELECT c.*, b.business_type, b.business_name 
     FROM customers c
     JOIN businesses b ON c.business_id = b.id
     WHERE c.business_id = $1 
     ORDER BY c.created_at DESC`,
    [business_id],
  );

  return result.rows;
};

const findById = async (id) => {
  const result = await db.query(
    `SELECT c.*, b.business_type, b.business_name 
     FROM customers c
     JOIN businesses b ON c.business_id = b.id
     WHERE c.id = $1`,
    [id],
  );

  return result.rows[0];
};

const findByPhone = async (business_id, phone) => {
  const result = await db.query("SELECT * FROM customers WHERE business_id = $1 AND phone = $2", [business_id, phone]);
  return result.rows[0];
};

const update = async (id, { full_name, is_verified, payment_due_day, monthly_fee }) => {
  const result = await db.callProcedure("update_customer", [id, full_name, is_verified, payment_due_day, monthly_fee]);
  return result.rows[0];
};

const deleteCustomer = async (id) => {
  const result = await db.callProcedure("delete_customer", [id]);
  return result.rows[0];
};

const updateMetrics = async (id, metrics) => {
  const fields = [];
  const values = [];
  let index = 1;

  Object.keys(metrics).forEach((key) => {
    fields.push(`${key} = $${index}`);
    values.push(metrics[key]);
    index++;
  });

  values.push(id);
  const result = await db.query(`UPDATE customers SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`, values);
  return result.rows[0];
};

module.exports = {
  create,
  findByBusinessId,
  findById,
  findByPhone,
  update,
  deleteCustomer,
  updateMetrics,
};
