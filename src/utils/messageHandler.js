// src/utils/messageHandler.js
const UserController = require('../controllers/userController');
const RecaptchaController = require('../controllers/recaptchaController');
const TwoFAController = require('../controllers/twofaController');
const SurfebeController = require('../controllers/surfebeController');

class MessageHandler {
  static async handleUserMessage(action, data) {
    console.log('Handling user message:', { action, data });
    
    switch (action) {
      case 'CREATE':
        return await UserController.createUser(data);
      case 'GET_ALL':
        return await UserController.getAllUsers();
      case 'GET_BY_EMAIL':
        return await UserController.getUserByEmail(data.email);
      case 'UPDATE':
        return await UserController.updateUser(data.email, data);
      case 'DELETE':
        return await UserController.deleteUser(data.email);
      default:
        throw new Error('Unknown user action');
    }
  }

  static async handleRecaptchaMessage(action, data) {
    switch (action) {
      case 'CREATE':
        return await RecaptchaController.createRecaptcha(data);
      case 'GET_ALL':
        return await RecaptchaController.getAllRecaptchas();
      case 'GET_RECAPTCHA':
        return await RecaptchaController.getRecaptcha();
      case 'GET_TOKEN':
        return await RecaptchaController.getRecaptchaToken();
      case 'UPDATE':
        return await RecaptchaController.updateRecaptcha(data);
      case 'DELETE':
        return await RecaptchaController.deleteRecaptcha(data.siteKey);
      default:
        throw new Error('Unknown recaptcha action');
    }
  }

  static async handleOTPMessage(action, data) {
    switch (action) {
      case 'GENERATE':
        return await TwoFAController.generateOTP(data.email);
      case 'VERIFY':
        return await TwoFAController.verifyOTP(data.email, data.token);
      default:
        throw new Error('Unknown OTP action');
    }
  }

  static async handleSurfebeMessage(action, data) {
    switch (action) {
      case 'REGISTER_SURFEBE':
        return await SurfebeController.registerSurfebe(data.email);
      case 'LOGIN_SURFEBE':
        return await SurfebeController.loginSurfebe(data.email);
      case 'CONFIRM_CAPTCHA_SURFEBE':
        return await SurfebeController.confirmCaptchaSurfebe(data.email);
      case 'PROFILE_SURFEBE':
        return await SurfebeController.getProfileSurfebe(data.email);
      case 'GET_TASKS':
        return await SurfebeController.getTasks(data.version, data.email);
      case 'COMPLETE_VISIT':
        return await SurfebeController.completeVisit(data.version, data.taskKey, data.email);
      default:
        throw new Error('Unknown surfebe action');
    }
  }
}

module.exports = MessageHandler;