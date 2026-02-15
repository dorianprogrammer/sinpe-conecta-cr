const db = require("../utils/db");

const create = async ({ business_id, payment_id, notification_type, message }) => {
  const result = await db.callProcedure("create_notification", [business_id, payment_id, notification_type, message]);

  return result.rows[0];
};

const findByBusinessId = async (business_id, is_read = null) => {
  let query = "SELECT * FROM notifications WHERE business_id = $1";
  const params = [business_id];

  if (is_read !== null) {
    query += " AND is_read = $2";
    params.push(is_read);
  }

  query += " ORDER BY created_at DESC";

  const result = await db.query(query, params);
  return result.rows;
};

const markAsRead = async (id) => {
  const result = await db.callProcedure("mark_notification_read", [id]);
  return result.rows[0];
};

const markAllAsRead = async (business_id) => {
  const result = await db.query(
    "UPDATE notifications SET is_read = TRUE WHERE business_id = $1 AND is_read = FALSE RETURNING *",
    [business_id],
  );
  return result.rows;
};

module.exports = {
  create,
  findByBusinessId,
  markAsRead,
  markAllAsRead,
};
