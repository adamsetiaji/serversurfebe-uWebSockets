// src/controllers/surfebeController.js
const userController = require('./userController');
const recaptchaController = require('./recaptchaController');
const { JSDOM } = require('jsdom');
const axios = require('axios');

class SurfebeController {
  static async registerSurfebe(email) {
    try {
      // Get user data
      const userData = await userController.getUserByEmail(email);
      if (!userData.success) {
        return {
          success: false,
          error: 'Failed to get user data'
        };
      }

      // Get recaptcha g_response
      const recaptchaResponse = await recaptchaController.getRecaptcha();
      if (!recaptchaResponse.success) {
        return recaptchaResponse;
      }

      const formData = new URLSearchParams();
      formData.append('g-recaptcha-response', recaptchaResponse.data.g_response);
      formData.append('login', userData.data.name);
      formData.append('email', userData.data.email);
      formData.append('password', userData.data.password_surfebe);

      const response = await axios.post("https://surfe.be/react-api/auth/reg", formData, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Content-Type": "application/x-www-form-urlencoded",
          "Cookie": userData.data.cookieSurfebe
        }
      });

      // Update user cookie if registration successful
      if (response.data.success) {
        await userController.updateUser(email, {
          isRegisterSurfebe: 1,
          cookieSurfebe: response.headers['set-cookie']?.join('; ')
        });
      }

      return {
        success: response.data.success,
        data: response.data
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  static async loginSurfebe(email) {
    try {
      // Get user data
      const userData = await userController.getUserByEmail(email);
      if (!userData.success) {
        return {
          success: false,
          error: 'Failed to get user data'
        };
      }

      // Get recaptcha g_response
      const recaptchaResponse = await recaptchaController.getRecaptcha();
      if (!recaptchaResponse.success) {
        return recaptchaResponse;
      }

      const formData = new URLSearchParams();
      formData.append('g-recaptcha-response', recaptchaResponse.data.g_response);
      formData.append('login', userData.data.email);
      formData.append('password', userData.data.password_surfebe);

      const response = await axios.post("https://surfe.be/react-api/auth/login", formData, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Content-Type": "application/x-www-form-urlencoded",
          "Cookie": userData.data.cookieSurfebe
        }
      });

      // Update user cookie if login successful
      if (response.data.success) {
        await userController.updateUser(email, {
          isLoginSurfebe: 1,
          cookieSurfebe: response.headers['set-cookie']?.join('; ')
        });
      }

      return {
        success: response.data.success,
        data: response.data
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  static async confirmCaptchaSurfebe(email) {
    try {
      // Get user data
      const userData = await userController.getUserByEmail(email);
      if (!userData.success) {
        return {
          success: false,
          error: 'Failed to get user data'
        };
      }

      // Get recaptcha g_response
      const recaptchaData = await recaptchaController.getRecaptcha();
      if (!recaptchaData.success) {
        return {
          success: false,
          error: recaptchaData.error || 'Failed to get recaptcha data'
        };
      }

      const response = await axios.post("https://surfe.be/ext/h-captcha", 
        `g-recaptcha-response=${encodeURIComponent(recaptchaData.data.g_response)}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0",
            "Cookie": userData.data.cookieSurfebe
          }
        }
      );

      const responseText = response.data;
      if (typeof responseText === 'string' && responseText.includes("This window can be closed")) {
        return {
          success: true,
          message: "Captcha confirmed successfully"
        };
      }

      return {
        success: false,
        error: "Failed to confirm captcha",
        details: responseText
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  static async getProfileSurfebe(email) {
    try {
      // Get user data
      const userData = await userController.getUserByEmail(email);
      if (!userData.success) {
        return {
          success: false,
          error: 'Failed to get user data'
        };
      }

      const response = await axios.get("https://surfe.be/react-api/user/profile", {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Cookie": userData.data.cookieSurfebe
        }
      });

      // Update balance if profile fetched successfully
      if (response.data.balance) {
        await userController.updateUser(email, {
          balanceSurfebe: response.data.balance
        });
      }

      return {
        success: true,
        data: {
          profileName: response.data.profileName,
          email: response.data.email,
          username: response.data.username,
          photo: response.data.photo,
          balance: response.data.balance
        }
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  static parseVisits(htmlContent) {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    const visits = [];
    const taskElements = document.querySelectorAll('.task');

    taskElements.forEach(task => {
      const visitData = {
        id: task.querySelector('.task_title')?.textContent?.trim(),
        time: task.querySelector('.task_time span')?.textContent?.trim(),
        price: task.querySelector('.task_price')?.textContent?.trim(),
        visit_start: task.querySelector('.task_btn')?.dataset?.visit_start,
        type: task.querySelector('.task_ico')?.classList.contains('blue') ? 'video' : 'visit'
      };
      visits.push(visitData);
    });

    return visits;
  }

  static async getTasks(version, email) {
    try {
      const userData = await userController.getUserByEmail(email);
      if (!userData.success) {
        return {
          success: false,
          error: 'Failed to get user data'
        };
      }

      const response = await axios.post(`https://surfe.be/ext-v2/popup?ver=${version}`,
        "task=false",
        {
          headers: {
            "accept": "*/*",
            "content-type": "application/x-www-form-urlencoded",
            "Cookie": userData.data.cookieSurfebe,
            "Origin": "https://surfe.be",
            "Referer": "https://surfe.be/"
          }
        }
      );

      // Check if response contains captcha
      if (response.data.content.toLowerCase().includes('h-captcha')) {
        return {
          success: false,
          message: "Need Confirm Captcha"
        };
      }

      // Check if response contains login
      if (response.data.content.toLowerCase().includes('login')) {
        return {
          success: false,
          message: "Cookie Expired, Need Login Again"
        };
      }

      const tasks = this.parseVisits(response.data.content);

      if (!tasks || tasks.length === 0) {
        return {
          success: false,
          message: "Task Null",
          data: []
        };
      }

      return {
        success: true,
        message: "Task Available",
        data: tasks
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  static async completeVisit(version, taskKey, email) {
    try {
      const userData = await userController.getUserByEmail(email);
      if (!userData.success) {
        return {
          success: false,
          error: 'Failed to get user data'
        };
      }

      const response = await axios.post(
        `https://surfe.be/ext-v2/task-complete?ver=${version}&key=${taskKey}`,
        null,
        {
          headers: {
            "accept": "*/*",
            "content-type": "application/x-www-form-urlencoded",
            "Cookie": userData.data.cookieSurfebe,
            "Origin": "https://surfe.be",
            "Referer": "https://surfe.be/"
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }
}

module.exports = SurfebeController;