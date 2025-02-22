// src/controllers/recaptchaController.js
const Recaptcha = require('../models/Recaptcha');
const axios = require('axios');
const { validateRecaptcha } = require('../utils/validation');
const RecaptchaTimer = require('../utils/timerController');

class RecaptchaController {
  static async createRecaptcha(data) {
    try {
      const validation = validateRecaptcha(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      const existingRecaptcha = await Recaptcha.findBySiteKey(data.site_key);
      if (existingRecaptcha) {
        return {
          success: false,
          error: 'Site key already exists'
        };
      }

      await Recaptcha.create(validation.sanitizedData);
      const created = await Recaptcha.findBySiteKey(data.site_key);

      return {
        success: true,
        data: created
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  static async getAllRecaptchas() {
    try {
      const recaptchas = await Recaptcha.findAll();
      return {
        success: true,
        data: recaptchas
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  static async getRecaptcha() {
    try {
      const siteKey = process.env.SITEKEY;
      const recaptcha = await Recaptcha.findBySiteKey(siteKey);
      
      if (!recaptcha) {
        return {
          success: false,
          error: 'Recaptcha not found'
        };
      }

      return {
        success: true,
        data: recaptcha
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  static async getRecaptchaToken() {
    try {
      // Create task request
      const createTaskResponse = await axios.post(process.env.BASE_URL_CREATE_TASK, {
        clientKey: process.env.RECAPTCHA_CLIENT_KEY
      });

      if (!createTaskResponse.data.success) {
        return {
          success: false,
          error: 'Failed to create recaptcha task'
        };
      }

      const taskId = createTaskResponse.data.taskId;
      let result = await this.pollTaskResult(taskId);

      if (!result.success) {
        return result;
      }

      // Update token in database
      const updateResult = await this.updateTokenRecaptcha(result.solution.gRecaptchaResponse);
      
      if (!updateResult.success) {
        return {
          success: false,
          error: 'Failed to update recaptcha status in database',
          details: updateResult.error
        };
      }

      return {
        success: true,
        message: "Database Recaptcha Updated",
        data: {
          updateData: updateResult.data,
          timestamp: result.timestamp
        }
      };

    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  static async pollTaskResult(taskId, maxAttempts = 30) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const resultResponse = await axios.post(process.env.BASE_URL_GET_TASK_RESULT, {
        clientKey: process.env.RECAPTCHA_CLIENT_KEY,
        taskId: taskId
      });

      const { status, solution } = resultResponse.data;

      if (status === 'completed' && solution?.gRecaptchaResponse) {
        return resultResponse.data;
      }

      if (status === 'completed' && !solution) {
        return { success: false, error: 'Failed to get valid solution' };
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return { success: false, error: 'Timeout waiting for task result' };
  }

  static async updateTokenRecaptcha(g_response) {
    try {
      if (!g_response) {
        return { success: false, error: 'g_response is required' };
      }

      const siteKey = process.env.SITEKEY;
      const existing = await Recaptcha.findBySiteKey(siteKey);
      
      if (!existing) {
        return { success: false, error: 'Recaptcha not found' };
      }

      const updateData = {
        ...existing,
        g_response: g_response,
        status_g_response: true,
        time_g_response: "00:01:40"
      };

      await Recaptcha.updateBySiteKey(siteKey, updateData);
      
      // Start timer
      await RecaptchaTimer.startTimer(siteKey, "00:01:40");
      
      return { 
        success: true, 
        data: updateData 
      };
    } catch (err) {
      return { 
        success: false, 
        error: err.message 
      };
    }
  }

  static async updateRecaptcha(data) {
    try {
      const siteKey = process.env.SITEKEY;
      const existing = await Recaptcha.findBySiteKey(siteKey);
      
      if (!existing) {
        return {
          success: false,
          error: 'Recaptcha not found'
        };
      }

      const validation = validateRecaptcha(data, true);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      const updatedData = {
        ...existing,
        ...validation.sanitizedData
      };

      await Recaptcha.updateBySiteKey(siteKey, updatedData);
      const updated = await Recaptcha.findBySiteKey(siteKey);

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

  static async deleteRecaptcha(siteKey) {
    try {
      const existing = await Recaptcha.findBySiteKey(siteKey);
      if (!existing) {
        return {
          success: false,
          error: 'Recaptcha not found'
        };
      }

      await Recaptcha.deleteBySiteKey(siteKey);
      RecaptchaTimer.stopTimer(siteKey);

      return {
        success: true,
        message: 'Recaptcha deleted successfully'
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }
}

module.exports = RecaptchaController;