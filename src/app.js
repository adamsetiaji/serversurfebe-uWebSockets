// src/app.js
const uWS = require('uWebSockets.js');
const { Worker } = require('worker_threads');
const path = require('path');
const cluster = require('cluster');

class WebSocketApp {
  constructor() {
    this.connections = new Map();
    this.workers = new Map();
    this.initializeWorkers();
  }

  initializeWorkers() {
    const worker = new Worker(path.join(__dirname, 'workers', 'websocketWorker.js'));
    
    worker.on('message', (message) => {
      // Send response back to primary process
      process.send({
        type: 'send',
        connectionId: message.connectionId,
        data: message.data
      });
    });

    worker.on('error', (error) => {
      console.error(`Worker thread error in worker ${cluster.worker.id}:`, error);
    });

    this.workers.set('websocket', worker);
  }

  handleMessage(connectionId, data) {
    console.log(`Processing message for connection ${connectionId}:`, data);
    
    // Forward message to worker thread for processing
    this.workers.get('websocket').postMessage({
      connectionId,
      data
    });
  }

  generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  }

  async gracefulShutdown() {
    console.log(`Worker ${cluster.worker.id} shutting down...`);
    
    // Terminate worker threads
    for (const [id, worker] of this.workers) {
      await worker.terminate();
    }
  }
}

module.exports = { WebSocketApp, uWS };