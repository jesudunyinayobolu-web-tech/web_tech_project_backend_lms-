# web_tech_project_backend_lms-
# Library Management System - Backend

## Project Overview

RESTful API backend for the Academic City University Library Management System. Built with Node.js and Express.js, providing authentication, book management, and borrowing functionality.

## Deployment

🔗 **Backend**: `https://web-tech-project-backend-lms.onrender.com`
🔗 **Live URL**: `https://jesudunyinayobolu-web-tech.github.io/web_tech_project_frontend_lms/`
  

**Note**: Update this URL after deploying to Render.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Books
- `GET /api/books` - Get all books (with search & filter)
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Borrowing
- `POST /api/borrow` - Borrow a book
- `GET /api/borrow` - Get user's borrowed books
- `PUT /api/borrow/:id/return` - Return a book

### Health
- `GET /health` - API health check

## Technologies

- Node.js
- Express.js
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs
- express-validator
- CORS

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file:
   ```env
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://jesudunyin:HwraWL1iV8Lq6BsPZzXUYIjSrs8V2Cxz@dpg-d4oe1f49c44c73fdji0g-a.frankfurt-postgres.render.com:5432/library_db_zhg7?sslmode=require"
JWT_SECRET=03d4ca77ecb9b8954b03f34c6d1551e24782fe727b9175a1590103274840f0d08ed89671fba8df9234b2986cc50048e7aeb925d197e3217c0d66c9d5605e7632
FRONTEND_URL=https://jesudunyinayobolu-web-tech.github.io
   ```

3. **Set up database**:
   - Create PostgreSQL database
   
4. **Start server**:
   ```bash
   npm start
   ```

   For development:
   ```bash
   npx nodemon server.js
   ```

## Project Structure

```
backend/
├── config/
│   └── database.js          # DB connection
├── controllers/
│   ├── authController.js    # Auth logic
│   ├── bookController.js    # Book operations
│   └── borrowcontroller.js  # Borrow operations
├── middleware/
│   └── auth.js              # JWT middleware
├── routes/
│   ├── auth.js
│   ├── books.js
│   └── borrow.js
├── .env                     # Environment variables
├── package.json
└── server.js                # Entry point
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend deployment URL for CORS

## Database Schema

See main README.md for complete database schema.

## Security

- Password hashing with bcryptjs
- JWT token authentication
- Input validation with express-validator
- CORS configuration
- Environment variable protection
