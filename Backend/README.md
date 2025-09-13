# Portfolio Backend API

A comprehensive Node.js backend API for a portfolio website with authentication, content management, and contact functionality.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Contact Management**: Contact form with email notifications
- **Project Management**: CRUD operations for portfolio projects
- **Skills Management**: Categorized skills with proficiency levels
- **Blog System**: Full-featured blog with categories, tags, and search
- **Email Integration**: Automated email notifications
- **Image Upload**: Support for image uploads (Cloudinary integration)
- **API Documentation**: Swagger/OpenAPI documentation
- **Security**: Rate limiting, CORS, helmet, input validation
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Email**: Nodemailer
- **File Upload**: Multer + Cloudinary
- **Documentation**: Swagger
- **Security**: Helmet, CORS, bcryptjs
- **Development**: Nodemon, Jest

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd portfolio-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # Database
   MONGODB_URI=mongodb://localhost:27017/portfolio

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d

   # Email (Gmail example)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=your_email@gmail.com

   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Admin User
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=admin123456
   ```

4. **Database Setup**

   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in your `.env` file

5. **Seed Database (Optional)**
   ```bash
   node seedDatabase.js
   ```
   This will create sample data including an admin user, projects, skills, and blog posts.

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000` (or your specified PORT).

## API Documentation

Once the server is running, visit `http://localhost:5000/api-docs` for interactive API documentation.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/update-profile` - Update user profile

### Contact

- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contacts (Admin)
- `GET /api/contact/:id` - Get single contact (Admin)
- `PUT /api/contact/:id` - Update contact status (Admin)
- `DELETE /api/contact/:id` - Delete contact (Admin)

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/featured` - Get featured projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (Admin)
- `PUT /api/projects/:id` - Update project (Admin)
- `DELETE /api/projects/:id` - Delete project (Admin)
- `PUT /api/projects/reorder` - Reorder projects (Admin)

### Skills

- `GET /api/skills` - Get all skills
- `GET /api/skills/categories` - Get skills by category
- `GET /api/skills/:id` - Get single skill
- `POST /api/skills` - Create skill (Admin)
- `PUT /api/skills/:id` - Update skill (Admin)
- `DELETE /api/skills/:id` - Delete skill (Admin)
- `PUT /api/skills/reorder` - Reorder skills (Admin)
- `POST /api/skills/bulk` - Create multiple skills (Admin)

### Blog

- `GET /api/blog` - Get all blog posts
- `GET /api/blog/featured` - Get featured blog posts
- `GET /api/blog/:slug` - Get single blog post
- `POST /api/blog` - Create blog post (Admin)
- `PUT /api/blog/:id` - Update blog post (Admin)
- `DELETE /api/blog/:id` - Delete blog post (Admin)
- `POST /api/blog/:id/like` - Like blog post
- `GET /api/blog/tags` - Get all tags

### Health Check

- `GET /health` - Server health check

## Email Configuration

### Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → App passwords
   - Generate password for "Mail"
3. Use the generated password in `EMAIL_PASS`

### Other Email Providers

Update the SMTP settings in your `.env` file according to your email provider.

## Image Upload Configuration

The API supports image uploads through Cloudinary:

1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Update the Cloudinary configuration in your `.env` file

## Security Features

- **Rate Limiting**: Prevents abuse with configurable rate limits
- **CORS**: Configured for your frontend domain
- **Helmet**: Security headers
- **Input Validation**: Server-side validation for all inputs
- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication

## Database Schema

### User

- name, email, password, role, avatar, isActive

### Project

- title, description, technologies, category, status, images, URLs, dates

### Skill

- name, category, proficiency, icon, color, experience, order

### Contact

- name, email, subject, message, status, priority, metadata

### Blog

- title, slug, content, author, category, tags, status, metadata

## Development

### Adding New Routes

1. Create route file in `/routes`
2. Add validation in `/utils/validation.js`
3. Import and use in `server.js`

### Database Models

Models are located in `/models` directory using Mongoose schemas.

### Middleware

Custom middleware in `/middleware` directory for authentication and other concerns.

## Testing

```bash
npm test
```

## Deployment

### Environment Variables

Ensure all production environment variables are set.

### Database

Use MongoDB Atlas or your preferred MongoDB hosting service.

### Hosting Options

- **Heroku**: Easy deployment with Git
- **Digital Ocean**: App Platform or Droplets
- **AWS**: EC2, Elastic Beanstalk, or Lambda
- **Vercel**: Serverless functions

### Production Considerations

- Set `NODE_ENV=production`
- Use a process manager like PM2
- Set up SSL certificates
- Configure reverse proxy (Nginx)
- Set up logging and monitoring

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository or contact the development team.
