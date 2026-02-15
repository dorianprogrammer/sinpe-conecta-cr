const { pool } = require('../config/database');

const query = async (text, params) => {
  const result = await pool.query(text, params);
  return result;
};

const callProcedure = async (procedureName, params = []) => {
  const placeholders = params.map((_, i) => `$${i + 1}`).join(', ');
  const queryText = `SELECT * FROM ${procedureName}(${placeholders})`;
  return query(queryText, params);
};

const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  query,
  callProcedure,
  transaction
};