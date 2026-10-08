# User Service

User profile management microservice for CloudRetail e-commerce platform.

## Features

- User profile CRUD operations
- AWS Cognito integration for authentication
- Role-based access control (RBAC)
- GDPR-compliant user deletion
- Swagger API documentation
- Unit tests with Jest

## API Endpoints

### Public Endpoints
- `POST /api/users` - Create user profile (after Cognito signup)

### Protected Endpoints (Requires Authentication)
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `DELETE /api/users/me` - Delete current user account

### Admin Endpoints
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user by ID
- `DELETE /api/users/:id` - Delete user by ID

## Environment Variables

See `.env.example` for required environment variables.

## Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run migrate

# Start development server
npm run dev

# Run tests
npm test
```

## Database Schema

```prisma
model User {
  id            String   @id @default(uuid())
  cognitoUserId String   @unique
  email         String   @unique
  firstName     String?
  lastName      String?
  phone         String?
  address       String?
  city          String?
  state         String?
  zipCode       String?
  country       String?
  avatar        String?
  role          Role     @default(CUSTOMER)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## API Documentation

Access Swagger documentation at: `http://localhost:3001/api-docs`
