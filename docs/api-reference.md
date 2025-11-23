# API Documentation

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input or email already exists

---

### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Headers:**
- Sets `Authentication` cookie with HttpOnly flag

**Error Responses:**
- `401 Unauthorized` - Invalid credentials

---

### POST /auth/logout
Clear authentication session.

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Headers:**
- Clears `Authentication` cookie

---

## User Endpoints

### GET /users
Get all users (with serialization - passwords excluded).

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "user1@example.com",
    "name": "User One"
  },
  {
    "id": 2,
    "email": "user2@example.com",
    "name": "User Two"
  }
]
```

---

### GET /users/:id
Get a specific user by ID.

**Parameters:**
- `id` (number) - User ID

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Error Responses:**
- `404 Not Found` - User not found

---

### POST /users
Create a new user.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}
```

**Response (200 OK):**
```json
{
  "id": 3,
  "email": "newuser@example.com",
  "name": "New User"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input or email already exists

---

## Authentication

### Using JWT Token

Include the JWT token in requests using either:

**1. Cookie (Automatic)**
The token is automatically sent in the `Authentication` cookie after login.

**2. Authorization Header**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example Authenticated Request

```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Or if using cookies:
```bash
curl -X GET http://localhost:3000/users \
  --cookie "Authentication=YOUR_JWT_TOKEN"
```

---

## Error Responses

All error responses follow this format:

```json
{
  "message": "Error description",
  "error": "Optional error details"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Request successful
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required or failed
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting middleware for production use.

---

## CORS

CORS is enabled with credentials support. The following headers are set:
- `Access-Control-Allow-Origin: *` (or specific origin)
- `Access-Control-Allow-Credentials: true`

---

## Content Type

All requests and responses use `application/json` content type.

**Request Header:**
```
Content-Type: application/json
```

**Response Header:**
```
Content-Type: application/json
```
