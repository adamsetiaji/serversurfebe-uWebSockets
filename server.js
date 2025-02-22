// server.js
const uWS = require('uWebSockets.js');
const cluster = require('cluster');
const os = require('os');
require('dotenv').config();

const numCPUs = os.cpus().length;
const port = parseInt(process.env.PORT || '6969', 10);

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running on port ${port}`);
  console.log(`Starting ${numCPUs} workers...`);

  const app = uWS.App();
  
  // Track connections and workers
  const connections = new Map();
  const workers = new Map();
  let currentWorker = 0;

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    workers.set(worker.id, worker);

    worker.on('message', (message) => {
      if (message.type === 'ready') {
        console.log(`Worker ${worker.id} is ready`);
      } else if (message.type === 'send') {
        // Find client connection and send response
        const ws = connections.get(message.connectionId);
        if (ws && ws.send) {
          console.log(`Sending response to client ${message.connectionId}:`, message.data);
          ws.send(JSON.stringify(message.data));
        }
      }
    });
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.id} died (${signal || code}). Restarting...`);
    workers.delete(worker.id);
    const newWorker = cluster.fork();
    workers.set(newWorker.id, newWorker);
  });

  app.ws('/*', {
    compression: uWS.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 120,

    open: (ws) => {
      // Assign to worker using round-robin
      const workerIds = Array.from(workers.keys());
      const selectedWorker = workers.get(workerIds[currentWorker]);
      currentWorker = (currentWorker + 1) % workerIds.length;

      const connectionId = Math.random().toString(36).substr(2, 9);
      ws.id = connectionId;
      ws.workerId = selectedWorker.id;
      connections.set(connectionId, ws);

      console.log(`New connection ${connectionId} assigned to worker ${selectedWorker.id}`);
    },

    message: (ws, message) => {
      const worker = workers.get(ws.workerId);
      if (worker) {
        try {
          const msgData = JSON.parse(Buffer.from(message).toString());
          console.log(`Message from client ${ws.id}:`, msgData);

          worker.send({
            type: 'message',
            connectionId: ws.id,
            data: msgData
          });
        } catch (error) {
          console.error('Error processing message:', error);
          ws.send(JSON.stringify({
            success: false,
            error: 'Invalid message format'
          }));
        }
      }
    },

    close: (ws) => {
      console.log(`Connection ${ws.id} closed`);
      connections.delete(ws.id);
    }
  });

  app.listen(port, (token) => {
    if (token) {
      console.log(`Main server listening on port ${port}`);
    } else {
      console.error('Failed to start server');
      process.exit(1);
    }
  });

} else {
  // Worker processes
  const { WebSocketApp } = require('./src/app');

  require('./src/config/database').then(async () => {
    console.log(`Worker ${cluster.worker.id} database initialized`);

    try {
      const app = new WebSocketApp();
      
      process.on('message', (message) => {
        if (message.type === 'message') {
          console.log(`Worker ${cluster.worker.id} received message:`, message);
          
          // Process message and send response
          app.handleMessage(message.connectionId, message.data);
        }
      });

      process.send({ type: 'ready' });

    } catch (err) {
      console.error(`Worker ${cluster.worker.id} failed to initialize:`, err);
      process.exit(1);
    }
  });
}