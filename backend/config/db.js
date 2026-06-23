const mysql = require('mysql2');
require('dotenv').config();

const sslConfig = process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: true }
  : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'subscription_billing',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslConfig
});

const promisePool = pool.promise();

module.exports = promisePool;
