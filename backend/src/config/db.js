require('dotenv').config();
const mysql = require('mysql2/promise');

// Hosted databases (TiDB Cloud, Aiven, ...) require an encrypted connection: set DB_SSL=true.
// Optionally provide the provider's CA certificate text in DB_SSL_CA.
const ssl =
  String(process.env.DB_SSL).toLowerCase() === 'true'
    ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
        ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n') } : {}),
      }
    : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_management_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl,
  // Return DATE columns as 'YYYY-MM-DD' strings (avoids timezone shifts)
  dateStrings: true,
});

module.exports = pool;
