// src/controllers/twofaController.js
const User = require('../models/User');
const speakeasy = require('speakeasy');

class TwoFAController {
  static async generateOTP(email) {
    try {
      // Validate input
      if (!email) {
        return {
          success: false,
          error: 'Email is required'
        };
      }

      console.log('Generating OTP for email:', email);

      const user = await User.findByEmail(email);
      console.log('Found user:', user);

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      if (!user.secret2faSurfebe) {
        return {
          success: false,
          error: 'User does not have 2FA secret configured'
        };
      }

      // Generate token using secret from database
      const token = speakeasy.totp({
        secret: user.secret2faSurfebe,
        encoding: 'base32'
      });

      return {
        success: true,
        data: {
          otp: token
        }
      };
    } catch (err) {
      console.error('Error in generateOTP:', err);
      return {
        success: false,
        error: err.message
      };
    }
  }

  static async verifyOTP(email, token) {
    try {
      if (!email || !token) {
        return {
          success: false,
          error: 'Email and token are required'
        };
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      if (!user.secret2faSurfebe) {
        return {
          success: false,
          error: 'User does not have 2FA secret configured'
        };
      }

      const verified = speakeasy.totp.verify({
        secret: user.secret2faSurfebe,
        encoding: 'base32',
        token: token,
        window: 1
      });

      return {
        success: true,
        data: {
          verified
        }
      };
    } catch (err) {
      console.error('Error in verifyOTP:', err);
      return {
        success: false,
        error: err.message
      };
    }
  }

  static async setupSecret(email) {
    try {
      if (!email) {
        return {
          success: false,
          error: 'Email is required'
        };
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Generate new secret
      const secret = speakeasy.generateSecret({
        name: `SurfeBe:${user.email}`
      });

      // Save to database
      await User.updateByEmail(email, {
        secret2faSurfebe: secret.base32
      });

      return {
        success: true,
        data: {
          secret: secret.base32,
          otpauth_url: secret.otpauth_url
        }
      };
    } catch (err) {
      console.error('Error in setupSecret:', err);
      return {
        success: false,
        error: err.message
      };
    }
  }
}

module.exports = TwoFAController;