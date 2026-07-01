const mysql = require('mysql2');
require('dotenv').config();

const env = process.env;

// Pool untuk support transactions (getConnection)
const db = mysql.createPool({
    host: env.DB_HOST || '127.0.0.1',
    user: env.DB_USER || 'root',
    password: env.DB_PASS || '',
    database: env.DB_NAME || 'risol_mayo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, conn) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        return;
    }
    console.log('Connected to database (pool)');
    conn.release();
});

db.on('error', (err) => {
    console.error('Database pool error:', err.message);
});

module.exports = db;
