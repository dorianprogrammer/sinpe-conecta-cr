const db = require("../utils/db");
const bcrypt = require("bcryptjs");

const create = async ({ email, password, full_name, phone, role = "user" }) => {
  const password_hash = await bcrypt.hash(password, 10);
  const result = await db.callProcedure("create_user", [email, password_hash, full_name, phone, role]);
  return result.rows[0];
};

const findByEmail = async (email) => {
  const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
};

const findById = async (id) => {
  const result = await db.query("SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = $1", [id]);
  return result.rows[0];
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  create,
  findByEmail,
  findById,
  verifyPassword,
};
