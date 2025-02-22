// src/config/database.js
const mysql = require('mysql2');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = null;
  }

  async initialize() {
    try {
      // Create initial pool without database
      const initialPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        waitForConnections: true,
        connectionLimit: 20, // Increased for better performance
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      }).promise();

      // Create database if not exists
      await initialPool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);

      // Create main pool with database
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 20,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      }).promise();

      // Initialize tables
      await this.initializeTables();
      
      console.log('Database connection and tables initialized successfully');
      return this.pool;
    } catch (error) {
      console.error('Database initialization error:', error);
      process.exit(1);
    }
  }

  async initializeTables() {
    // Users table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        uuid CHAR(36),
        name VARCHAR(255),
        email VARCHAR(255),
        password_surfebe VARCHAR(255),
        cookieSurfebe TEXT,
        secret2faSurfebe VARCHAR(255),
        userIdSurfebe VARCHAR(255),
        balanceSurfebe DECIMAL(16,8),
        isRegisterSurfebe TINYINT(1) DEFAULT 0,
        isLoginSurfebe TINYINT(1) DEFAULT 0,
        payeerAccount VARCHAR(255),
        payeerPassword VARCHAR(255),
        payeerMasterKey VARCHAR(255),
        payeerSecretKey VARCHAR(255),
        payeerBalance DECIMAL(16,8),
        payeerCookie TEXT,
        isRegisterPayeer TINYINT(1) DEFAULT 0,
        isLoginPayeer TINYINT(1) DEFAULT 0,
        isRunning TINYINT(1) DEFAULT 0,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_uuid (uuid)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Recaptchas table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS recaptchas (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        uuid CHAR(36),
        site VARCHAR(255),
        site_key VARCHAR(255),
        g_response LONGTEXT,
        status_g_response TINYINT(1) DEFAULT 0,
        time_g_response TIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_site_key (site_key),
        INDEX idx_uuid (uuid)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  getPool() {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }
    return this.pool;
  }
}

// Create singleton instance
const database = new Database();

// Export initialized promise
module.exports = database.initialize();