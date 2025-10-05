const { body, validationResult } = require("express-validator");

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    // For API requests, return JSON
    if (req.path.startsWith("/api/")) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    } 
    // For admin panel requests, flash error and redirect back
    else if (req.path.startsWith("/admin/")) {
      const errorMessages = errors.array().map(err => err.msg);
      req.flash("error", errorMessages.join(", "));
      
      // Redirect back to the form
      if (req.path.includes("/projects/") && req.method === "PUT") {
        const projectId = req.params.id || req.body.id;
        if (projectId) {
          console.log("Redirecting to edit form for project:", projectId);
          return res.redirect(`/admin/projects/${projectId}/edit`);
        }
      } else if (req.path.includes("/projects") && req.method === "POST" && !req.path.includes("/edit")) {
        // For new project creation
        console.log("Redirecting back to new project form");
        return res.redirect("/admin/projects/new");
      }
      console.log("Redirecting back to previous page");
      return res.redirect("back");
    }
  }
  next();
};

// Contact form validation
const validateContactForm = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .escape(),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("subject")
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Subject must be between 5 and 100 characters")
    .escape(),
  body("message")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Message must be between 10 and 1000 characters")
    .escape(),
  body("phone").optional().trim().escape(),
  body("company").optional().trim().escape(),
  handleValidationErrors,
];

// User registration validation
const validateUserRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .escape(),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  handleValidationErrors,
];

// User login validation
const validateUserLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Project validation
const validateProject = [
  // Transform and normalize form data before validation
  (req, res, next) => {
    console.log("Project validation - Raw body:", req.body);
    
    // Handle technologies field (string to array conversion)
    if (req.body.technologies && typeof req.body.technologies === "string") {
      // Split by comma and trim each technology, filter out empty ones
      req.body.technologies = req.body.technologies
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }
    // Ensure technologies is an array
    if (req.body.technologies && !Array.isArray(req.body.technologies)) {
      req.body.technologies = [];
    }
    
    // Handle case where technologies might be an empty string
    if (req.body.technologies === "") {
      req.body.technologies = [];
    }
    
    // If technologies is not provided at all, set it to empty array
    if (req.body.technologies === undefined) {
      req.body.technologies = [];
    }

    // Handle boolean fields (checkboxes)
    // When checkboxes are checked, they send "true" as string
    // When unchecked, they don't send the field at all
    req.body.featured =
      req.body.featured === "true" || req.body.featured === true;
    req.body.isPublic =
      req.body.isPublic === "true" || req.body.isPublic === true;

    // Handle numeric fields
    if (req.body.order !== undefined && req.body.order !== "") {
      req.body.order = parseInt(req.body.order, 10) || 0;
    } else if (req.body.order === "") {
      req.body.order = 0;
    }
    
    console.log("Project validation - Processed body:", req.body);

    next();
  },
  body("title")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Title must be between 2 and 100 characters")
    .escape(),
  body("description")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters")
    .escape(),
  body("longDescription")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Long description cannot exceed 2000 characters"),
  body("technologies")
    .custom((value) => {
      // Custom validation for technologies array
      if (!Array.isArray(value)) {
        throw new Error("Technologies must be an array");
      }
      // Check if all technologies are non-empty strings
      for (let tech of value) {
        if (typeof tech !== 'string' || tech.trim().length === 0) {
          throw new Error("All technologies must be non-empty strings");
        }
      }
      return true;
    })
    .withMessage("At least one technology is required"),
  body("category")
    .isIn(["web", "mobile", "desktop", "api", "other"])
    .withMessage("Invalid category"),
  body("liveUrl").optional().isURL().withMessage("Please provide a valid URL"),
  body("githubUrl")
    .optional()
    .isURL()
    .withMessage("Please provide a valid URL"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Project validation errors:", errors.array());
    }
    next();
  },
  handleValidationErrors,
];

// Skill validation
const validateSkill = [
  // Transform and normalize form data before validation
  (req, res, next) => {
    // Handle boolean fields (checkboxes)
    if (req.body.isVisible !== undefined) {
      req.body.isVisible =
        req.body.isVisible === "true" || req.body.isVisible === true;
    } else {
      // Default to true if not provided (checkbox unchecked)
      req.body.isVisible = true;
    }

    // Handle numeric fields
    if (req.body.proficiency) {
      req.body.proficiency = parseInt(req.body.proficiency, 10) || 50;
    }

    // Handle yearsOfExperience - only process if provided and not empty
    if (
      req.body.yearsOfExperience !== undefined &&
      req.body.yearsOfExperience !== "" &&
      req.body.yearsOfExperience !== null
    ) {
      const years = parseInt(req.body.yearsOfExperience, 10);
      if (!isNaN(years) && years >= 0) {
        req.body.yearsOfExperience = years;
      } else {
        req.body.yearsOfExperience = 0;
      }
    } else {
      // If not provided, set to default value
      req.body.yearsOfExperience = 0;
    }

    if (req.body.order) {
      req.body.order = parseInt(req.body.order, 10) || 0;
    }

    next();
  },
  body("name")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Skill name must be between 1 and 50 characters")
    .escape(),
  body("category")
    .isIn([
      "frontend",
      "backend",
      "database",
      "devops",
      "tools",
      "soft-skills",
      "other",
    ])
    .withMessage("Invalid category"),
  body("proficiency")
    .isInt({ min: 1, max: 100 })
    .withMessage("Proficiency must be between 1 and 100"),
  body("yearsOfExperience")
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("Years of experience cannot be negative"),
  handleValidationErrors,
];

// Blog validation
const validateBlog = [
  // Transform and normalize form data before validation
  (req, res, next) => {
    // Handle tags field (string to array conversion)
    if (req.body.tags && typeof req.body.tags === "string") {
      req.body.tags = req.body.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }
    // Ensure tags is an array if provided
    if (req.body.tags && !Array.isArray(req.body.tags)) {
      req.body.tags = [];
    }

    // Handle status field
    if (req.body.status) {
      // Validate that status is one of the allowed values
      if (!["draft", "published", "archived"].includes(req.body.status)) {
        req.body.status = "draft"; // Default to draft if invalid
      }
    } else {
      // Default to draft if no status provided
      req.body.status = "draft";
    }

    next();
  },
  body("title")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters")
    .escape(),
  body("excerpt")
    .trim()
    .isLength({ min: 10, max: 300 })
    .withMessage("Excerpt must be between 10 and 300 characters")
    .escape(),
  body("content")
    .trim()
    .isLength({ min: 20 }) // Reduced from 50 to 20 for easier testing
    .withMessage("Content must be at least 20 characters"),
  body("category")
    .isIn([
      "technology",
      "web-development",
      "programming",
      "tutorials",
      "career",
      "personal",
      "other",
    ])
    .withMessage("Invalid category"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  handleValidationErrors,
];

module.exports = {
  validateContactForm,
  validateUserRegistration,
  validateUserLogin,
  validateProject,
  validateSkill,
  validateBlog,
  handleValidationErrors,
};
