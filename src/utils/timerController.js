// src/utils/timerController.js
const Recaptcha = require('../models/Recaptcha');

class RecaptchaTimer {
  constructor() {
    this.timers = new Map();
  }

  parseTimeString(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  formatTimeString(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  async startTimer(siteKey, initialTime) {
    // Stop existing timer if any
    this.stopTimer(siteKey);

    let remainingTime = this.parseTimeString(initialTime);
    
    const updateInterval = async () => {
      remainingTime -= 1000;
      
      if (remainingTime <= 0) {
        await this.handleTimerExpired(siteKey);
        return;
      }

      const timeString = this.formatTimeString(remainingTime);
      await this.updateTime(siteKey, timeString);
      
      this.timers.set(siteKey, setTimeout(updateInterval, 1000));
    };

    this.timers.set(siteKey, setTimeout(updateInterval, 1000));
  }

  async updateTime(siteKey, timeString) {
    try {
      const recaptcha = await Recaptcha.findBySiteKey(siteKey);
      if (!recaptcha) {
        throw new Error('Recaptcha not found');
      }

      const updateData = {
        ...recaptcha,
        time_g_response: timeString
      };

      await Recaptcha.updateBySiteKey(siteKey, updateData);
      
      return {
        type: 'RECAPTCHA',
        action: 'UPDATE',
        success: true,
        data: updateData
      };
    } catch (error) {
      console.error('Error updating time:', error);
      return {
        type: 'RECAPTCHA',
        action: 'UPDATE',
        success: false,
        error: error.message
      };
    }
  }

  async handleTimerExpired(siteKey) {
    try {
      const recaptcha = await Recaptcha.findBySiteKey(siteKey);
      if (!recaptcha) {
        throw new Error('Recaptcha not found');
      }

      const updateData = {
        ...recaptcha,
        g_response: null,
        status_g_response: false,
        time_g_response: '00:00:00'
      };

      await Recaptcha.updateBySiteKey(siteKey, updateData);
      
      this.stopTimer(siteKey);

      return {
        type: 'RECAPTCHA',
        action: 'UPDATE',
        success: true,
        data: updateData
      };
    } catch (error) {
      console.error('Error handling timer expiration:', error);
      return {
        type: 'RECAPTCHA',
        action: 'UPDATE',
        success: false,
        error: error.message
      };
    }
  }

  stopTimer(siteKey) {
    const timer = this.timers.get(siteKey);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(siteKey);
    }
  }

  stopAllTimers() {
    for (const [siteKey, timer] of this.timers) {
      clearTimeout(timer);
      this.timers.delete(siteKey);
    }
  }
}

// Export singleton instance
module.exports = new RecaptchaTimer();