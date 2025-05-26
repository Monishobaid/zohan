# Zohane Backend

A JavaScript Express.js backend for the Zohane document management system.

## Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Document Management**: CRUD operations for documents
- **Folder Management**: Organize documents in folders
- **Tag Management**: Tag documents for better organization
- **Security**: Helmet, CORS, and rate limiting
- **Mock Data**: In-memory storage for development

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production

```bash
npm start
```

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email and password
- `POST /auth/register` - Register a new user
- `GET /auth/me` - Get current user (requires auth)
- `POST /auth/logout` - Logout (requires auth)
- `GET /auth/check` - Check authentication status

### Documents
- `GET /documents` - Get user documents (requires auth)
- `POST /documents` - Create a new document (requires auth)
- `GET /documents/:id` - Get a specific document (requires auth)
- `PATCH /documents/:id` - Update a document (requires auth)
- `DELETE /documents/:id` - Delete a document (requires auth)

### Folders
- `GET /folders` - Get user folders (requires auth)
- `POST /folders` - Create a new folder (requires auth)

### Tags
- `GET /tags` - Get user tags (requires auth)
- `POST /tags` - Create a new tag (requires auth)

### Health Check
- `GET /health` - Server health check

## Default User

For testing, use these credentials:
- Email: `test@example.com`
- Password: `password`

## Environment Variables

- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - JWT secret key (default: 'your-secret-key')
- `FRONTEND_URL` - Frontend URL for CORS (default: 'http://localhost:5174')
- `NODE_ENV` - Environment (development/production)

## Architecture

This is a simplified JavaScript implementation that replaces the previous TypeScript version. All functionality is contained in a single `src/index.js` file for easier development and deployment.

The backend uses:
- Express.js for the web framework
- bcryptjs for password hashing
- jsonwebtoken for JWT authentication
- helmet for security headers
- cors for cross-origin requests
- express-rate-limit for rate limiting

Data is stored in memory for development purposes. In production, you would replace the mock data arrays with a proper database. 