// src/controllers/userController.js
const User = require('../models/User');
const { validateUser } = require('../utils/validation');

class UserController {
  static async createUser(data) {
    try {
      console.log('Creating user with data:', data);

      // Extract user data from the correct location
      const userData = data.data || data;

      if (!userData.name || !userData.email || !userData.password_surfebe) {
        return {
          success: false,
          error: 'Name, email and password are required'
        };
      }

      // Check if email exists
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          error: 'Email already registered'
        };
      }

      // Create user
      await User.create(userData);
      const createdUser = await User.findByEmail(userData.email);

      return {
        success: true,
        data: createdUser
      };

    } catch (err) {
      console.error('Error in createUser:', err);
      return {
        success: false,
        error: err.message
      };
    }
  }

  static async getAllUsers() {
    try {
      const users = await User.findAll();
      return {
        success: true,
        data: users
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  static async getUserByEmail(email) {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      return {
        success: true,
        data: user
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  static async updateUser(email, data) {
    try {
      const existingUser = await User.findByEmail(email);
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Merge existing data with updates
      const updatedData = {
        ...existingUser,
        ...data
      };

      await User.updateByEmail(email, updatedData);
      const updated = await User.findByEmail(email);
      
      return {
        success: true,
        data: updated
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  static async deleteUser(email) {
    try {
      const result = await User.deleteByEmail(email);
      return {
        success: true,
        data: result
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }
}

module.exports = UserController;