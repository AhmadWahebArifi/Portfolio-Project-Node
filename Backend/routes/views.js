const express = require("express");
const moment = require("moment");
const { marked } = require("marked");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const path = require("path");

// Models
const { User, Project, Skill, Blog, Contact } = require("../models");

// Utils
const {
  sendContactNotification,
  sendContactAutoReply,
} = require("../utils/email");
const { validateContactForm } = require("../utils/validation");

const router = express.Router();

// Create DOMPurify instance
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Configure marked for safe HTML
marked.setOptions({
  headerIds: false,
  mangle: false,
});

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    req.flash("error", "Access denied. Admin privileges required.");
    return res.redirect("/admin/login");
  }
  next();
};

// Helper function to safely render markdown
const renderMarkdown = (content) => {
  if (!content) return "";
  const html = marked(content);
  return DOMPurify.sanitize(html);
};

// Make helper functions available to views
router.use((req, res, next) => {
  res.locals.moment = moment;
  res.locals.renderMarkdown = renderMarkdown;
  next();
});

// ================== PUBLIC ROUTES ==================

// Home page
router.get("/", async (req, res) => {
  try {
    const [featuredProjects, skills, featuredBlogs] = await Promise.all([
      Project.findAll({
        where: { featured: true, isPublic: true },
        order: [["order", "ASC"]],
        limit: 6,
      }),
      Skill.findAll({
        where: { isVisible: true },
        order: [
          ["category", "ASC"],
          ["order", "ASC"],
          ["proficiency", "DESC"],
        ],
      }),
      Blog.findAll({
        where: { featured: true, status: "published" },
        include: [{ model: User, as: "author", attributes: ["name"] }],
        order: [["publishedAt", "DESC"]],
        limit: 3,
        attributes: { exclude: ["content"] },
      }),
    ]);

    // Group skills by category
    const groupedSkills = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    res.render("index", {
      title: "Portfolio - Welcome",
      featuredProjects,
      groupedSkills,
      featuredBlogs,
    });
  } catch (error) {
    console.error("Home page error:", error);
    req.flash("error", "Error loading page content");
    res.render("index", {
      title: "Portfolio - Welcome",
      featuredProjects: [],
      groupedSkills: {},
      featuredBlogs: [],
    });
  }
});

// Skills page
router.get("/skills", async (req, res) => {
  try {
    const skills = await Skill.findAll({
      where: { isVisible: true },
      order: [
        ["category", "ASC"],
        ["order", "ASC"],
        ["proficiency", "DESC"],
      ],
    });

    const groupedSkills = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    // Get featured skills (top proficiency)
    const featuredSkills = skills
      .filter((skill) => skill.proficiency >= 80)
      .sort((a, b) => b.proficiency - a.proficiency)
      .slice(0, 6);

    // Calculate average experience
    const avgExperience =
      skills.length > 0
        ? Math.round(
            skills.reduce((sum, skill) => sum + skill.yearsOfExperience, 0) /
              skills.length
          )
        : 0;

    // Helper functions for the view
    const getCategoryIcon = (category) => {
      const icons = {
        frontend: "laptop-code",
        backend: "server",
        database: "database",
        devops: "cloud",
        tools: "tools",
        "soft-skills": "users",
        other: "cog",
      };
      return icons[category] || "code";
    };

    const getCategoryDescription = (category) => {
      const descriptions = {
        frontend: "User interface development and client-side technologies",
        backend: "Server-side development and API creation",
        database: "Data storage, management, and optimization",
        devops: "Deployment, infrastructure, and automation",
        tools: "Development tools and productivity software",
        "soft-skills": "Communication, leadership, and collaboration",
        other: "Additional skills and technologies",
      };
      return descriptions[category] || "Technical expertise and knowledge";
    };

    const getSkillLevel = (proficiency) => {
      if (proficiency >= 90) return "expert";
      if (proficiency >= 75) return "advanced";
      if (proficiency >= 50) return "intermediate";
      return "beginner";
    };

    const getSkillLevelText = (proficiency) => {
      if (proficiency >= 90) return "Expert";
      if (proficiency >= 75) return "Advanced";
      if (proficiency >= 50) return "Intermediate";
      return "Beginner";
    };

    res.render("skills", {
      title: "My Skills & Expertise",
      groupedSkills,
      featuredSkills,
      totalSkills: skills.length,
      avgExperience,
      getCategoryIcon,
      getCategoryDescription,
      getSkillLevel,
      getSkillLevelText,
    });
  } catch (error) {
    console.error("Skills page error:", error);
    req.flash("error", "Error loading skills page");
    res.render("skills", {
      title: "My Skills & Expertise",
      groupedSkills: {},
      featuredSkills: [],
      totalSkills: 0,
      avgExperience: 0,
      getCategoryIcon: () => "code",
      getCategoryDescription: () => "",
      getSkillLevel: () => "beginner",
      getSkillLevelText: () => "Beginner",
    });
  }
});

// About page
router.get("/about", async (req, res) => {
  try {
    const skills = await Skill.findAll({
      where: { isVisible: true },
      order: [
        ["category", "ASC"],
        ["order", "ASC"],
        ["proficiency", "DESC"],
      ],
    });

    const groupedSkills = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    res.render("about", {
      title: "About Me",
      groupedSkills,
    });
  } catch (error) {
    console.error("About page error:", error);
    req.flash("error", "Error loading about page");
    res.render("about", {
      title: "About Me",
      groupedSkills: {},
    });
  }
});

// Skills page
router.get("/skills", async (req, res) => {
  try {
    const skills = await Skill.findAll({
      where: { isVisible: true },
      order: [
        ["category", "ASC"],
        ["order", "ASC"],
        ["proficiency", "DESC"],
      ],
    });

    const groupedSkills = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    // Get featured skills (top proficiency)
    const featuredSkills = skills
      .filter((skill) => skill.proficiency >= 80)
      .sort((a, b) => b.proficiency - a.proficiency)
      .slice(0, 6);

    // Calculate average experience
    const avgExperience =
      skills.length > 0
        ? Math.round(
            skills.reduce((sum, skill) => sum + skill.yearsOfExperience, 0) /
              skills.length
          )
        : 0;

    // Helper functions for the view
    const getCategoryIcon = (category) => {
      const icons = {
        frontend: "laptop-code",
        backend: "server",
        database: "database",
        devops: "cloud",
        tools: "tools",
        "soft-skills": "users",
        other: "cog",
      };
      return icons[category] || "code";
    };

    const getCategoryDescription = (category) => {
      const descriptions = {
        frontend: "User interface development and client-side technologies",
        backend: "Server-side development and API creation",
        database: "Data storage, management, and optimization",
        devops: "Deployment, infrastructure, and automation",
        tools: "Development tools and productivity software",
        "soft-skills": "Communication, leadership, and collaboration",
        other: "Additional skills and technologies",
      };
      return descriptions[category] || "Technical expertise and knowledge";
    };

    const getSkillLevel = (proficiency) => {
      if (proficiency >= 90) return "expert";
      if (proficiency >= 75) return "advanced";
      if (proficiency >= 50) return "intermediate";
      return "beginner";
    };

    const getSkillLevelText = (proficiency) => {
      if (proficiency >= 90) return "Expert";
      if (proficiency >= 75) return "Advanced";
      if (proficiency >= 50) return "Intermediate";
      return "Beginner";
    };

    res.render("skills", {
      title: "My Skills & Expertise",
      groupedSkills,
      featuredSkills,
      totalSkills: skills.length,
      avgExperience,
      getCategoryIcon,
      getCategoryDescription,
      getSkillLevel,
      getSkillLevelText,
    });
  } catch (error) {
    console.error("Skills page error:", error);
    req.flash("error", "Error loading skills page");
    res.render("skills", {
      title: "My Skills & Expertise",
      groupedSkills: {},
      featuredSkills: [],
      totalSkills: 0,
      avgExperience: 0,
      getCategoryIcon: () => "code",
      getCategoryDescription: () => "",
      getSkillLevel: () => "beginner",
      getSkillLevelText: () => "Beginner",
    });
  }
});

// Projects page
router.get("/projects", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;

    let query = { isPublic: true };
    if (req.query.category) {
      query.category = req.query.category;
    }

    const [projects, total] = await Promise.all([
      Project.findAll({
        where: query,
        order: [
          ["featured", "DESC"],
          ["order", "ASC"],
          ["createdAt", "DESC"],
        ],
        offset: skip,
        limit: limit,
      }),
      Project.count({ where: query }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.render("projects", {
      title: "My Projects",
      projects,
      currentPage: page,
      totalPages,
      selectedCategory: req.query.category || "",
      categories: ["web", "mobile", "desktop", "api", "other"],
    });
  } catch (error) {
    console.error("Projects page error:", error);
    req.flash("error", "Error loading projects");
    res.render("projects", {
      title: "My Projects",
      projects: [],
      currentPage: 1,
      totalPages: 1,
      selectedCategory: "",
      categories: [],
    });
  }
});

// Single project page
router.get("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findOne({
      where: {
        id: req.params.id,
        isPublic: true,
      },
    });

    if (!project) {
      req.flash("error", "Project not found");
      return res.redirect("/projects");
    }

    // Get related projects
    const relatedProjects = await Project.findAll({
      where: {
        id: { [require("sequelize").Op.ne]: project.id },
        category: project.category,
        isPublic: true,
      },
      limit: 3,
    });

    res.render("project-detail", {
      title: project.title,
      project,
      relatedProjects,
    });
  } catch (error) {
    console.error("Project detail error:", error);
    req.flash("error", "Error loading project");
    res.redirect("/projects");
  }
});

// Blog page
router.get("/blog", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    let query = { status: "published" };
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.tag) {
      query.tags = { [require("sequelize").Op.like]: `%${req.query.tag}%` };
    }
    if (req.query.search) {
      const { Op } = require("sequelize");
      query[Op.or] = [
        { title: { [Op.like]: `%${req.query.search}%` } },
        { excerpt: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    // Simple tags extraction for MySQL
    const tagsPromise = Blog.findAll({
      where: { status: "published" },
      attributes: ["tags"],
    }).then((results) => {
      const allTags = results.reduce((acc, blog) => {
        if (blog.tags && Array.isArray(blog.tags)) {
          acc.push(...blog.tags);
        }
        return acc;
      }, []);
      return [...new Set(allTags)].sort();
    });

    const [blogs, total, tags] = await Promise.all([
      Blog.findAll({
        where: query,
        include: [{ model: User, as: "author", attributes: ["name"] }],
        order: [
          ["featured", "DESC"],
          ["publishedAt", "DESC"],
        ],
        offset: skip,
        limit: limit,
        attributes: { exclude: ["content"] },
      }),
      Blog.count({ where: query }),
      tagsPromise,
    ]);

    const totalPages = Math.ceil(total / limit);

    res.render("blog", {
      title: "Blog",
      blogs,
      currentPage: page,
      totalPages,
      selectedCategory: req.query.category || "",
      selectedTag: req.query.tag || "",
      searchQuery: req.query.search || "",
      categories: [
        "technology",
        "web-development",
        "programming",
        "tutorials",
        "career",
        "personal",
        "other",
      ],
      tags: tags.sort(),
    });
  } catch (error) {
    console.error("Blog page error:", error);
    req.flash("error", "Error loading blog posts");
    res.render("blog", {
      title: "Blog",
      blogs: [],
      currentPage: 1,
      totalPages: 1,
      selectedCategory: "",
      selectedTag: "",
      searchQuery: "",
      categories: [],
      tags: [],
    });
  }
});

// Single blog post page
router.get("/blog/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({
      where: {
        slug: req.params.slug,
        status: "published",
      },
      include: [
        { model: User, as: "author", attributes: ["name", "email", "avatar"] },
      ],
    });

    if (!blog) {
      req.flash("error", "Blog post not found");
      return res.redirect("/blog");
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    // Get related posts - simpler query for MySQL
    const { Op } = require("sequelize");
    const relatedPosts = await Blog.findAll({
      where: {
        id: { [Op.ne]: blog.id },
        status: "published",
      },
      include: [{ model: User, as: "author", attributes: ["name"] }],
      order: [["publishedAt", "DESC"]],
      limit: 3,
      attributes: { exclude: ["content"] },
    });

    res.render("blog-detail", {
      title: blog.title,
      blog,
      relatedPosts,
    });
  } catch (error) {
    console.error("Blog detail error:", error);
    req.flash("error", "Error loading blog post");
    res.redirect("/blog");
  }
});

// Contact page
router.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Contact Me",
    formData: {},
  });
});

// Resume download
router.get("/resume", (req, res) => {
  const resumePath = path.join(__dirname, "../public/ahmad.pdf");
  const fs = require("fs");

  // Check if resume file exists
  if (fs.existsSync(resumePath)) {
    res.download(resumePath, "Ahmad_Waheb_Arifi_Resume.pdf", (err) => {
      if (err) {
        console.error("Resume download error:", err);
        req.flash("error", "Error downloading resume");
        res.redirect("/");
      }
    });
  } else {
    req.flash(
      "error",
      "Resume not found. Please contact Ahmad for the latest version."
    );
    res.redirect("/");
  }
});

// Handle contact form submission
router.post("/contact", validateContactForm, async (req, res) => {
  try {
    const { name, email, subject, message, phone, company } = req.body;

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get("User-Agent");

    // Create contact record
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      phone,
      company,
      ipAddress,
      userAgent,
    });

    // Send emails (optional - only if configured)
    try {
      if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
        await Promise.all([
          sendContactNotification(contact),
          sendContactAutoReply(contact),
        ]);
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError);
    }

    req.flash(
      "success",
      "Thank you for your message! I will get back to you soon."
    );
    res.redirect("/contact");
  } catch (error) {
    console.error("Contact form error:", error);
    req.flash(
      "error",
      "There was an error sending your message. Please try again."
    );
    res.render("contact", {
      title: "Contact Me",
      formData: req.body,
    });
  }
});

// ================== ADMIN ROUTES ==================

// Admin login page
router.get("/admin/login", (req, res) => {
  if (req.session.user && req.session.user.role === "admin") {
    return res.redirect("/admin");
  }
  res.render("admin/login", {
    title: "Admin Login",
    layout: "admin/layout",
  });
});

// Handle admin login
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      attributes: { include: ["password"] },
    });
    if (!user || !(await user.comparePassword(password))) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/admin/login");
    }

    if (user.role !== "admin") {
      req.flash("error", "Access denied. Admin privileges required.");
      return res.redirect("/admin/login");
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    req.flash("success", `Welcome back, ${user.name}!`);
    res.redirect("/admin");
  } catch (error) {
    console.error("Admin login error:", error);
    req.flash("error", "Login failed. Please try again.");
    res.redirect("/admin/login");
  }
});

// Admin logout
router.post("/admin/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
});

// Admin dashboard
router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const [
      totalProjects,
      totalSkills,
      totalBlogs,
      totalContacts,
      recentContacts,
      recentBlogs,
    ] = await Promise.all([
      Project.count(),
      Skill.count(),
      Blog.count(),
      Contact.count(),
      Contact.findAll({ order: [["createdAt", "DESC"]], limit: 5 }),
      Blog.findAll({
        include: [{ model: User, as: "author", attributes: ["name"] }],
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
    ]);

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      layout: "admin/layout",
      stats: {
        totalProjects,
        totalSkills,
        totalBlogs,
        totalContacts,
      },
      recentContacts,
      recentBlogs,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    req.flash("error", "Error loading dashboard");
    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      layout: "admin/layout",
      stats: {
        totalProjects: 0,
        totalSkills: 0,
        totalBlogs: 0,
        totalContacts: 0,
      },
      recentContacts: [],
      recentBlogs: [],
    });
  }
});

module.exports = router;
