// db.js
const mysql = require('mysql2/promise');

let pool;

async function createPool(dbConfig, connectionLimit) {
  try {
    pool = mysql.createPool({
      ...dbConfig,
      connectionLimit: connectionLimit,
    });
    await pool.getConnection();
    console.log('Database pool created successfully');
    return pool;
  } catch (error) {
    console.error('Error creating database pool:', error);
    throw error;
  }
}

async function getPool(dbConfig, connectionLimit = 10) {
  if (!pool) {
    await createPool(dbConfig, connectionLimit);
  }
  return pool;
}

module.exports = { getPool };
