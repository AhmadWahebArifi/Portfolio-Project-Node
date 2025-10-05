const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const flash = require("express-flash");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

// Add performance monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      // Log requests that take longer than 1 second
      console.log(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  next();
});

// View engine setup
app.use(expressLayouts);
app.set("layout", "layout");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret-here",
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "portfolio",
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Flash messages
app.use(flash());

// Method override for forms
app.use(methodOverride("_method"));

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
        ],
        fontSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
        ],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
app.use(morgan("combined"));

// Database connection
const { connectDB } = require("./config/database");
connectDB();

// Global variables for views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.messages = req.flash();
  res.locals.currentPath = req.path;

  next();
});

// Admin Routes (mount before view routes to avoid conflicts)
app.use("/admin", require("./routes/admin"));

// View Routes
app.use("/", require("./routes/views"));

// API Routes
app.use("/api/contact", require("./routes/contact"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/skills", require("./routes/skills"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/blog", require("./routes/blog"));

// API Documentation
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Portfolio API",
      version: "1.0.0",
      description: "API for Portfolio Project",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({
      success: false,
      message: "API route not found",
    });
  } else {
    res.status(404).render("error", {
      title: "Page Not Found",
      error: {
        status: 404,
        message: "The page you are looking for does not exist.",
      },
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (req.path.startsWith("/api/")) {
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  } else {
    res.status(500).render("error", {
      title: "Server Error",
      error: {
        status: 500,
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Something went wrong!",
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `API Documentation available at http://localhost:${PORT}/api-docs`
  );
});

module.exports = app;
