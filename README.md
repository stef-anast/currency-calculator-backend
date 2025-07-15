# Currency Calculator Backend

A production-ready Node.js application built with TypeScript that provides a secure REST API for currency conversion and exchange rate management.

> **Note:** This project is the successor to the original [Currency Calculator Backend](https://github.com/stefanast/currency-calculator-backend).

## Features

- **Secure Authentication** - JWT-based auth with persistent refresh tokens
- **Role-based Access Control** - Editor/viewer permissions for different operations
- **Currency Management** - Create, delete, and manage currencies
- **Exchange Rate Operations** - Set, update, and remove exchange rates between currencies
- **Currency Conversion** - Real-time currency conversion with stored exchange rates
- **Input Validation** - Comprehensive request validation and sanitization
- **Error Handling** - Standardized error responses and proper HTTP status codes
- **Type Safety** - Full TypeScript implementation with strict type checking

## Architecture

The project follows a clean 3-layer architecture:

```
Routes (HTTP) → Services (Business Logic) → Models (Database)
```

### Project Structure

```
├── config/           # Configuration and environment validation
├── middleware/       # Express middleware
│   ├── auth.ts      # JWT authentication
│   └── roles.ts     # Role-based access control
├── models/          # Mongoose schemas
│   ├── currency.ts  # Currency data model
│   ├── refreshToken.ts # Refresh token storage
│   └── user.ts      # User model with roles
├── routes/          # API endpoints
│   ├── auth.ts      # Authentication routes
│   └── currencies.ts # Currency management routes
├── services/        # Business logic layer
│   ├── currencyService.ts # Currency operations
│   └── tokenService.ts    # Token management
├── utils/           # Utility functions
│   └── responseUtils.ts   # Standardized API responses
├── types.ts         # TypeScript type definitions
└── index.ts         # Application entry point
```

## Setup

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Required
DATABASE_URI=mongodb://localhost:27017/currency-calculator
ACCESS_TOKEN_SECRET=your-access-token-secret-key
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key

# Optional
PORT=3000                    # Default: 3000
ACCESS_TOKEN_EXP=15m         # Default: 15m
```

**Security Note**: Generate strong, unique secrets for production deployment. The application will not start if required environment variables are missing.

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Development Scripts

```bash
npm run dev        # Start with auto-reload
npm run build      # Compile TypeScript
npm run lint       # Run ESLint
npm run lint:fix   # Fix linting issues
npm run format     # Check code formatting
npm run format:fix # Fix formatting issues
npm test           # Run tests
```

## API Documentation

### Authentication

All endpoints except registration require a valid JWT token in the `x-auth-token` header.

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "token": "refresh_token_here"
}
```

#### Logout

```http
DELETE /auth/logout
Content-Type: application/json

{
  "token": "refresh_token_here"
}
```

### Currencies

#### Get All Currencies

```http
GET /currencies
x-auth-token: your_jwt_token
```

#### Create Currency (Editor only)

```http
POST /currencies
x-auth-token: your_jwt_token
Content-Type: application/json

{
  "symbol": "USD",
  "name": "US Dollar"
}
```

#### Delete Currency (Editor only)

```http
DELETE /currencies
x-auth-token: your_jwt_token
Content-Type: application/json

{
  "symbol": "USD"
}
```

#### Set Exchange Rate (Editor only)

```http
PUT /currencies/rate
x-auth-token: your_jwt_token
Content-Type: application/json

{
  "base": "USD",
  "target": "EUR",
  "rate": 0.85
}
```

#### Remove Exchange Rate (Editor only)

```http
DELETE /currencies/rate
x-auth-token: your_jwt_token
Content-Type: application/json

{
  "base": "USD",
  "target": "EUR"
}
```

#### Convert Currency

```http
POST /currencies/convert
x-auth-token: your_jwt_token
Content-Type: application/json

{
  "base": "USD",
  "target": "EUR",
  "amount": 100
}
```

### Response Format

All API responses follow a consistent format:

```json
{
  "ok": true,
  "data": { ... },
  "msg": "Optional message",
  "count": 5
}
```

Error responses:

```json
{
  "ok": false,
  "msg": "Error description",
  "errors": [ ... ]
}
```

## User Roles

- **Viewer**: Can view currencies and convert amounts
- **Editor**: All viewer permissions plus create/delete currencies and manage exchange rates

New users are assigned the "viewer" role by default.

## Security Features

- JWT-based authentication with secure token storage
- Environment variable validation on startup
- Input validation and sanitization
- Role-based access control
- Persistent refresh token storage with automatic cleanup
- Password hashing with bcrypt
- CORS protection

## Error Handling

The API uses standard HTTP status codes and provides detailed error messages:

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error
