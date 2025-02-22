// src/utils/validation.js

// Helper functions for common validations
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const isValidPassword = (password) => {
    // At least 6 characters
    return password && password.length >= 6;
  };
  
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  exports.validateUser = (data, isUpdate = false) => {
    const errors = [];
  
    // Skip validation for fields not present during update
    if (!isUpdate || data.name !== undefined) {
      if (!data.name) {
        errors.push('Name is required');
      } else if (typeof data.name !== 'string') {
        errors.push('Name must be a string');
      } else if (data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
      }
    }
  
    if (!isUpdate || data.email !== undefined) {
      if (!data.email) {
        errors.push('Email is required');
      } else if (!isValidEmail(data.email)) {
        errors.push('Please provide a valid email address');
      }
    }
  
    if (!isUpdate || data.password_surfebe !== undefined) {
      if (!data.password_surfebe) {
        errors.push('Password is required');
      } else if (!isValidPassword(data.password_surfebe)) {
        errors.push('Password must be at least 6 characters long');
      }
    }
  
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? sanitizeData(data) : null
    };
  };
  
  exports.validateRecaptcha = (data, isUpdate = false) => {
    const errors = [];
  
    if (!isUpdate || data.site !== undefined) {
      if (!data.site) {
        errors.push('Site URL is required');
      } else if (!isValidUrl(data.site)) {
        errors.push('Please provide a valid site URL');
      }
    }
  
    if (!isUpdate || data.site_key !== undefined) {
      if (!data.site_key) {
        errors.push('Site key is required');
      }
    }
  
    if (data.g_response !== undefined) {
      if (typeof data.g_response !== 'string') {
        errors.push('g_response must be a string');
      }
    }
  
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? sanitizeData(data) : null
    };
  };
  
  exports.validateOTP = (token) => {
    const errors = [];
  
    if (!token) {
      errors.push('OTP token is required');
    } else if (typeof token !== 'string') {
      errors.push('OTP token must be a string');
    } else if (!/^\d{6}$/.test(token)) {
      errors.push('OTP token must be 6 digits');
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  const sanitizeData = (data) => {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        if (typeof value === 'string') {
          sanitized[key] = value.trim();
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeData(value);
        } else {
          sanitized[key] = value;
        }
      }
    }
    
    return sanitized;
  };