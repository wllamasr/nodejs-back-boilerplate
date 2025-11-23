# Getting Started

## Prerequisites

- Node.js 18 or higher
- MySQL 5.7+ (for development/production)
- npm or yarn

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd store
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=express_boilerplate
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
PORT=3000
```

### 4. Setup Database

Create the MySQL database:

```bash
mysql -u root -p
CREATE DATABASE express_boilerplate;
exit;
```

Push the schema to the database:

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`.

## Verify Installation

### Test the API

```bash
# Register a user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get all users
curl http://localhost:3000/users
```

### Run Tests

```bash
npm test
```

All tests should pass. Tests use in-memory SQLite, so no database setup is required.

## Next Steps

- Read the [User Guide](user-guide.md) to learn how to use the framework
- Check out the [Development Guide](development-guide.md) to start building features
- Review the [API Reference](api-reference.md) for available endpoints

## Troubleshooting

### Database Connection Errors

**Error:** `ER_ACCESS_DENIED_ERROR`
- Check your database credentials in `.env`
- Ensure MySQL is running

**Error:** `ER_BAD_DB_ERROR`
- The database doesn't exist
- Run `CREATE DATABASE express_boilerplate;` in MySQL

### Port Already in Use

**Error:** `EADDRINUSE`
- Another process is using port 3000
- Change `PORT` in `.env` or stop the other process

### Module Not Found Errors

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure you're using Node.js 18+

## Development vs Production

### Development Mode

```bash
npm run dev
```

- Uses nodemon for auto-reload
- Detailed error messages
- Debug logging enabled

### Production Mode

```bash
npm run build
NODE_ENV=production npm start
```

- Compiled TypeScript
- Optimized for performance
- Minimal logging
