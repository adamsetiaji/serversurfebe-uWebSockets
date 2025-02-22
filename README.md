# 🚀 SurfebeServer

A high-performance WebSocket server built with uWebSockets.js for handling Surfebe automation tasks.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

## ✨ Features

- 🔥 High-performance WebSocket server using uWebSockets.js
- 🔄 Multi-core support with worker threads
- 🛡️ Built-in reCAPTCHA handling
- 🔐 2FA support
- 📊 Real-time task management
- 🗃️ MySQL database integration
- ⚡ Load balancing and auto-scaling

## Push to Github Repository
```bash
    git remote add origin https://github.com/adamsetiaji/serversurfebe-uWebSockets.git

    git add .
    git commit -m "Initial commit: Add New"
    git push -u origin main --force
```

---

## Pull from Github Repository
```bash
    git remote add origin https://github.com/adamsetiaji/serversurfebe-uWebSockets.git

    git pull origin main
```
---


## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/adamsetiaji/serversurfebe-uWebSockets.git
cd serversurfebe-uWebSockets
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=6969
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=surfebeserver
DB_CONNECTION_LIMIT=20

# Recaptcha Configuration
RECAPTCHA_CLIENT_KEY=123456789
SITEKEY=6LfMEAwTAAAAAK5MkDsHyDg-SE7wisIDM1-5mDQs

# API Endpoints
BASE_URL_CREATE_TASK=https://recaptcha.margodam.online/api/createTask
BASE_URL_GET_TASK_RESULT=https://recaptcha.margodam.online/api/getTaskResult

# WebSocket Configuration
WS_MAX_PAYLOAD=16777216 # 16MB in bytes
WS_IDLE_TIMEOUT=120 # seconds
WS_BACKPRESSURE_LIMIT=1048576 # 1MB in bytes

# SSL Configuration (optional)
# SSL_KEY_FILE=path/to/key.pem
# SSL_CERT_FILE=path/to/cert.pem

# Worker Configuration
WORKER_THREADS=4 # Number of worker threads to spawn

# Security
JWT_SECRET=your_jwt_secret_here
COOKIE_SECRET=your_cookie_secret_here
```

4. **Start the server**
```bash
npm start
```

## 📡 WebSocket API Reference

### User Management

#### Create User
```json
Request:
{
    "type": "USER",
    "action": "CREATE",
    "data": {
        "name": "John Doe",
        "email": "john@example.com",
        "password_surfebe": "password123"
    }
}

Response:
{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "created_at": "2024-02-23T12:00:00Z"
    }
}
```

#### Get All Users
```json
Request:
{
    "type": "USER",
    "action": "GET_ALL"
}

Response:
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com"
        }
    ]
}
```

#### Get User by Email
```json
Request:
{
    "type": "USER",
    "action": "GET_BY_EMAIL",
    "email": "john@example.com"
}

Response:
{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
    }
}
```

#### Update User
```json
Request:
{
    "type": "USER",
    "action": "UPDATE",
    "email": "john@example.com",
    "data": {
        "name": "John Updated",
        "password_surfebe": "newpassword123"
    }
}

Response:
{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Updated",
        "email": "john@example.com"
    }
}
```

#### Delete User
```json
Request:
{
    "type": "USER",
    "action": "DELETE",
    "email": "john@example.com"
}

Response:
{
    "success": true,
    "message": "User deleted successfully"
}
```

### Recaptcha Management

#### Create Recaptcha
```json
Request:
{
    "type": "RECAPTCHA",
    "action": "CREATE",
    "data": {
        "site": "example.com",
        "site_key": "6LdAbc123"
    }
}

Response:
{
    "success": true,
    "data": {
        "id": 1,
        "site": "example.com",
        "site_key": "6LdAbc123"
    }
}
```

#### Get All Recaptchas
```json
Request:
{
    "type": "RECAPTCHA",
    "action": "GET_ALL"
}

Response:
{
    "success": true,
    "data": [
        {
            "id": 1,
            "site": "example.com",
            "site_key": "6LdAbc123"
        }
    ]
}
```

#### Get Token Recaptcha
```json
Request:
{
    "type": "RECAPTCHA",
    "action": "GET_TOKEN"
}

Response:
{
    "success": true,
    "message": "Database Recaptcha Updated",
    "data": {
        "updateData": {
            "g_response": "03AGdBq24hQ...",
            "status_g_response": true,
            "time_g_response": "00:01:40"
        },
        "timestamp": "2024-02-23T12:00:00Z"
    }
}
```

#### Get Recaptcha
```json
Request:
{
    "type": "RECAPTCHA",
    "action": "GET_RECAPTCHA"
}

Response:
{
    "success": true,
    "data": {
        "site": "example.com",
        "site_key": "6LdAbc123",
        "g_response": "03AGdBq24hQ..."
    }
}
```

#### Update Recaptcha
```json
Request:
{
    "type": "RECAPTCHA",
    "action": "UPDATE",
    "data": {
        "site": "newsite.com",
        "g_response": "response_token",
        "status_g_response": 1,
        "time_g_response": "00:01:30"
    }
}

Response:
{
    "success": true,
    "data": {
        "site": "newsite.com",
        "site_key": "6LdAbc123",
        "g_response": "response_token"
    }
}
```

#### Delete Recaptcha
```json
Request:
{
    "type": "RECAPTCHA",
    "action": "DELETE",
    "siteKey": "6LdAbc123"
}

Response:
{
    "success": true,
    "message": "Recaptcha deleted successfully"
}
```

### Surfebe Management

#### Register Surfebe
```json
Request:
{
    "type": "SURFEBE",
    "action": "REGISTER_SURFEBE",
    "email": "john@example.com"
}

Response:
{
    "success": true,
    "data": {
        "message": "Registration successful"
    }
}
```

#### Login Surfebe
```json
Request:
{
    "type": "SURFEBE",
    "action": "LOGIN_SURFEBE",
    "email": "john@example.com"
}

Response:
{
    "success": true,
    "data": {
        "message": "Login successful"
    }
}
```

#### Confirm Captcha Surfebe
```json
Request:
{
    "type": "SURFEBE",
    "action": "CONFIRM_CAPTCHA_SURFEBE",
    "email": "john@example.com"
}

Response:
{
    "success": true,
    "message": "Captcha confirmed successfully"
}
```

#### Get Profile Surfebe
```json
Request:
{
    "type": "SURFEBE",
    "action": "PROFILE_SURFEBE",
    "email": "john@example.com"
}

Response:
{
    "success": true,
    "data": {
        "profileName": "John",
        "email": "john@example.com",
        "username": "john_doe",
        "balance": 10.5
    }
}
```

#### Get Tasks
```json
Request:
{
    "type": "SURFEBE",
    "action": "GET_TASKS",
    "version": "182",
    "email": "john@example.com"
}

Response:
{
    "success": true,
    "message": "Task Available",
    "data": [
        {
            "id": "task1",
            "time": "30",
            "price": "0.01",
            "visit_start": "abc123",
            "type": "visit"
        }
    ]
}
```

#### Complete Visit
```json
Request:
{
    "type": "SURFEBE",
    "action": "COMPLETE_VISIT",
    "version": "182",
    "email": "john@example.com",
    "taskKey": "abc123=="
}

Response:
{
    "success": true,
    "data": {
        "message": "Visit completed successfully",
        "earned": "0.01"
    }
}
```

## 🏗️ Project Structure

```
surfebeserver/
├── src/
│   ├── config/
│   │   ├── database.js      # Database configuration
│   │   └── websocket.js     # WebSocket server configuration
│   ├── controllers/
│   │   ├── userController.js       # User management
│   │   ├── recaptchaController.js  # Recaptcha handling
│   │   ├── twofaController.js      # 2FA operations
│   │   └── surfebeController.js    # Surfebe API integration
│   ├── models/
│   │   ├── User.js         # User database model
│   │   └── Recaptcha.js    # Recaptcha database model
│   ├── utils/
│   │   ├── validation.js     # Input validation
│   │   ├── timerController.js # Timer management
│   │   └── messageHandler.js  # WebSocket message routing
│   ├── workers/
│   │   └── websocketWorker.js # Worker thread handler
│   └── app.js              # Main application entry
├── .env                    # Environment configuration
├── package.json           # Project dependencies
└── server.js             # Server entry point
```

## 🔥 Performance

The server is built for high performance using:
- uWebSockets.js for fast WebSocket handling
- Worker threads for CPU-intensive tasks
- Connection pooling for database operations
- Efficient memory management
- Auto-scaling across available CPU cores

## 🤝 Contributing

Feel free to contribute to this project. All contributions are welcome!

## 📝 License

This project is licensed under the MIT License.
