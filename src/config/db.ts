import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '0000', 
  database: 'opinion_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default db;