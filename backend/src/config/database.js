const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const initDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log('✓ Database connected successfully');
    client.release();
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, initDatabase };