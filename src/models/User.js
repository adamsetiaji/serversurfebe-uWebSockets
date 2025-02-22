// src/models/User.js
const mysql = require('mysql2/promise');
require('dotenv').config();

class User {
  static async getConnection() {
    if (!User.dbPool) {
      User.dbPool = await mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'surfebeserver',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    }
    return User.dbPool;
  }

  static async create(userData) {
    const pool = await this.getConnection();
    const { name, email, password_surfebe } = userData;
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_surfebe, payeerPassword, uuid) VALUES (?, ?, ?, ?, UUID())',
      [name, email, password_surfebe, password_surfebe]
    );
    return result;
  }

  static async findAll() {
    const pool = await this.getConnection();
    const [rows] = await pool.query('SELECT * FROM users');
    return rows;
  }

  static async findByEmail(email) {
    const pool = await this.getConnection();
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async updateByEmail(email, userData) {
    const pool = await this.getConnection();
    const [result] = await pool.execute(
      `UPDATE users SET 
        name = ?,
        password_surfebe = ?,
        cookieSurfebe = ?,
        secret2faSurfebe = ?,
        userIdSurfebe = ?,
        balanceSurfebe = ?,
        isRegisterSurfebe = ?,
        isLoginSurfebe = ?,
        payeerAccount = ?,
        payeerPassword = ?,
        payeerMasterKey = ?,
        payeerSecretKey = ?,
        payeerBalance = ?,
        payeerCookie = ?,
        isRegisterPayeer = ?,
        isLoginPayeer = ?,
        isRunning = ?,
        message = ?
      WHERE email = ?`,
      [
        userData.name,
        userData.password_surfebe,
        userData.cookieSurfebe,
        userData.secret2faSurfebe,
        userData.userIdSurfebe,
        userData.balanceSurfebe,
        userData.isRegisterSurfebe,
        userData.isLoginSurfebe,
        userData.payeerAccount,
        userData.payeerPassword,
        userData.payeerMasterKey,
        userData.payeerSecretKey,
        userData.payeerBalance,
        userData.payeerCookie,
        userData.isRegisterPayeer,
        userData.isLoginPayeer,
        userData.isRunning,
        userData.message,
        email
      ]
    );
    return result;
  }

  static async deleteByEmail(email) {
    const pool = await this.getConnection();
    const [result] = await pool.execute(
      'DELETE FROM users WHERE email = ?',
      [email]
    );
    return result;
  }
}

module.exports = User;