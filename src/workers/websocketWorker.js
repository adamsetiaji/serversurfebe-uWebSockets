// src/workers/websocketWorker.js
const { parentPort } = require('worker_threads');
const messageHandler = require('../utils/messageHandler');

parentPort.on('message', async (message) => {
  try {
    const { connectionId, data } = message;
    const { type, action, ...rest } = data;

    // Log incoming message
    console.log(`Worker thread received:`, { type, action, ...rest });

    let response;
    switch (type) {
      case 'RECAPTCHA':
        response = await messageHandler.handleRecaptchaMessage(action, rest);
        break;
      case 'USER':
        response = await messageHandler.handleUserMessage(action, rest);
        break;
      case 'OTP':
        response = await messageHandler.handleOTPMessage(action, rest);
        break;
      case 'SURFEBE':
        response = await messageHandler.handleSurfebeMessage(action, rest);
        break;
      default:
        response = {
          success: false,
          error: 'Unknown message type'
        };
    }

    // Log outgoing response
    console.log(`Worker thread sending:`, response);

    // Send response back
    parentPort.postMessage({
      connectionId,
      data: response
    });

  } catch (error) {
    console.error('Worker thread error:', error);
    parentPort.postMessage({
      connectionId: message.connectionId,
      data: {
        success: false,
        error: error.message
      }
    });
  }
});