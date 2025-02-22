// src/config/websocket.js
class WebSocketConfig {
    static getConfig() {
      return {
        compression: 1, // Enable compression
        maxPayloadLength: 16 * 1024 * 1024, // 16MB
        idleTimeout: 120, // 2 minutes
        maxBackpressure: 1024 * 1024, // 1MB
        closeOnBackpressureLimit: true,
        resetIdleTimeoutOnSend: true,
        sendPingsAutomatically: true,
        maxLifetime: 0, // Unlimited
      };
    }
  
    static getSSLConfig() {
      if (process.env.SSL_KEY_FILE && process.env.SSL_CERT_FILE) {
        return {
          key_file_name: process.env.SSL_KEY_FILE,
          cert_file_name: process.env.SSL_CERT_FILE,
        };
      }
      return null;
    }
  
    static getBehavior() {
      return {
        /* Shared WebSocket behavior options */
        upgrade: (res, req, context) => {
          console.log('Client connecting...');
          
          /* Keep track of abortions */
          const upgradeAborted = {aborted: false};
          
          /* You MUST copy data out of req here, as req is only valid within this immediate callback */
          const url = req.getUrl();
          const secWebSocketKey = req.getHeader('sec-websocket-key');
          const secWebSocketProtocol = req.getHeader('sec-websocket-protocol');
          const secWebSocketExtensions = req.getHeader('sec-websocket-extensions');
          
          /* Simulate doing "async" work before upgrading */
          setTimeout(() => {
            if (upgradeAborted.aborted) {
              console.log('Upgrade aborted');
              return;
            }
            
            /* This immediately calls open handler, you must not use res after this call */
            res.upgrade({
                url,
                secWebSocketKey,
                secWebSocketProtocol,
                secWebSocketExtensions
              },
              /* Use our copy of the data */
              secWebSocketKey,
              secWebSocketProtocol,
              secWebSocketExtensions,
              context
            );
            
          }, 0);
          
          /* You MUST register an abort handler to know if the upgrade was aborted by peer */
          res.onAborted(() => {
            upgradeAborted.aborted = true;
          });
        },
        
        open: (ws) => {
          console.log('Connection opened');
        },
        
        drain: (ws) => {
          console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
        },
        
        message: (ws, message, isBinary) => {
          /* Handle message */
          if (!isBinary) {
            try {
              const data = JSON.parse(Buffer.from(message).toString());
              ws.send(JSON.stringify({ received: true, data }));
            } catch (e) {
              ws.send(JSON.stringify({ error: 'Invalid JSON' }));
            }
          }
        },
        
        close: (ws, code, message) => {
          console.log('Connection closed');
        }
      };
    }
  
    static handleErrors(error) {
      console.error('WebSocket error:', error);
    }
  }
  
  module.exports = WebSocketConfig;