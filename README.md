# Exofo Backend

Express + MongoDB backend for the Exofo Company Management System.

## Setup

### 1. Create your `.env` file

```bash
cp .env.example .env
```

Open `.env` and paste your MongoDB Atlas connection string into `MONGODB_URI`.  
Also set a strong `JWT_SECRET` (minimum 64 random characters).

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

The server starts on **http://localhost:5000**.

---

## First-time Admin Setup

After the backend is running and MongoDB is connected, create your first admin account:

```bash
curl -X POST http://localhost:5000/api/auth/seed-admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Your Name","email":"admin@exofo.internal","password":"YourStrongPassword"}'
```

> This endpoint is blocked once any admin account exists. Remove it from routes after first use in production.

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login (admin or employee) | ❌ |
| POST | `/api/auth/logout` | Logout | ✅ Bearer |
| GET  | `/api/auth/me` | Get current user profile | ✅ Bearer |
| POST | `/api/auth/seed-admin` | Create first admin (dev only) | ❌ |
| GET  | `/api/health` | Server health check | ❌ |

### Login Request Body

```json
{
  "loginId": "EMP001",
  "password": "Welcome123!",
  "role": "employee"
}
```

```json
{
  "loginId": "admin@exofo.internal",
  "password": "YourPassword",
  "role": "admin"
}
```

### Login Response

```json
{
  "success": true,
  "message": "Welcome back, John Doe!",
  "token": "<jwt_token>",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "admin@exofo.internal",
    "role": "admin",
    "designation": "Administrator",
    "initials": "JD",
    "avatar": ""
  }
}
```

---

## Project Structure

```
exofo-backend/
├── .env.example          ← copy to .env and fill values
├── src/
│   ├── server.js         ← entry point
│   ├── config/
│   │   └── db.js         ← MongoDB connection
│   ├── models/
│   │   ├── Admin.js      ← Admin schema
│   │   └── Employee.js   ← Employee schema
│   ├── controllers/
│   │   └── authController.js
│   ├── routes/
│   │   └── auth.js
│   ├── middleware/
│   │   └── auth.js       ← JWT protect + adminOnly
│   └── utils/
│       └── jwt.js        ← sign / verify token
```

