const express = require("express");
const moment = require("moment");
const { User, Project, Skill, Blog, Contact } = require("../models");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  validateProject,
  validateSkill,
  validateBlog,
} = require("../utils/validation");

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  console.log("requireAdmin middleware called");
  console.log("Session user:", req.session.user);
  console.log(
    "User role:",
    req.session.user ? req.session.user.role : "no user"
  );

  if (!req.session.user || req.session.user.role !== "admin") {
    console.log("Redirecting to admin login");
    req.flash("error", "Access denied. Admin privileges required.");
    return res.redirect("/admin/login");
  }
  console.log("Admin access granted");
  next();
};

// Middleware to make helpers available to admin views
router.use((req, res, next) => {
  res.locals.moment = moment;
  next();
});

// ================== PROJECT MANAGEMENT ==================

// Projects list
router.get("/projects", requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { count, rows: projects } = await Project.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.render("admin/projects/index", {
      title: "Manage Projects",
      layout: "admin/layout",
      projects,
      currentPage: page,
      totalPages,
      totalCount: count,
    });
  } catch (error) {
    console.error("Admin projects error:", error);
    req.flash("error", "Error loading projects");
    res.redirect("/admin");
  }
});

// New project form
router.get("/projects/new", requireAdmin, (req, res) => {
  res.render("admin/projects/form", {
    title: "Add New Project",
    layout: "admin/layout",
    project: {},
    action: "/admin/projects",
    method: "POST",
  });
});

// Create project
router.post("/projects", requireAdmin, validateProject, async (req, res) => {
  try {
    await Project.create(req.body);
    req.flash("success", "Project created successfully!");
    res.redirect("/admin/projects");
  } catch (error) {
    console.error("Create project error:", error);
    req.flash("error", "Error creating project");
    res.render("admin/projects/form", {
      title: "Add New Project",
      layout: "admin/layout",
      project: req.body,
      action: "/admin/projects",
      method: "POST",
    });
  }
});

// Edit project form
router.get("/projects/:id/edit", requireAdmin, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      req.flash("error", "Project not found");
      return res.redirect("/admin/projects");
    }

    res.render("admin/projects/form", {
      title: "Edit Project",
      layout: "admin/layout",
      project,
      action: `/admin/projects/${project.id}`,
      method: "PUT",
    });
  } catch (error) {
    console.error("Edit project error:", error);
    req.flash("error", "Error loading project");
    res.redirect("/admin/projects");
  }
});

// View project details
router.get("/projects/:id", requireAdmin, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      req.flash("error", "Project not found");
      return res.redirect("/admin/projects");
    }

    res.render("admin/projects/view", {
      title: `Project: ${project.title}`,
      layout: "admin/layout",
      project,
    });
  } catch (error) {
    console.error("View project error:", error);
    req.flash("error", "Error loading project");
    res.redirect("/admin/projects");
  }
});

// Update project
router.put("/projects/:id", requireAdmin, validateProject, async (req, res) => {
  try {
    console.log("UPDATE PROJECT - Raw body:", req.body);

    const project = await Project.findByPk(req.params.id);
    if (!project) {
      req.flash("error", "Project not found");
      return res.redirect("/admin/projects");
    }

    console.log("UPDATE PROJECT - Before update:", {
      id: project.id,
      featured: project.featured,
      isPublic: project.isPublic,
    });

    await project.update(req.body);

    console.log("UPDATE PROJECT - After update:", {
      id: project.id,
      featured: project.featured,
      isPublic: project.isPublic,
    });

    req.flash("success", "Project updated successfully!");
    res.redirect("/admin/projects");
  } catch (error) {
    console.error("Update project error:", error);
    req.flash("error", "Error updating project");
    res.redirect("/admin/projects");
  }
});

// Delete project
router.delete("/projects/:id", requireAdmin, async (req, res) => {
  try {
    console.log("DELETE PROJECT - Request params:", req.params);

    const project = await Project.findByPk(req.params.id);
    if (!project) {
      console.log("DELETE PROJECT - Project not found for ID:", req.params.id);
      req.flash("error", "Project not found");
      return res.redirect("/admin/projects");
    }

    console.log("DELETE PROJECT - Found project:", project.title);

    await project.destroy();
    console.log("DELETE PROJECT - Successfully deleted");

    req.flash("success", "Project deleted successfully!");
    res.redirect("/admin/projects");
  } catch (error) {
    console.error("Delete project error:", error);
    req.flash("error", "Error deleting project: " + error.message);
    res.redirect("/admin/projects");
  }
});

// Admin profile page
router.get("/profile", requireAdmin, async (req, res) => {
  try {
    // Get the current user's full information
    const user = await User.findByPk(req.session.user.id);

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin");
    }

    res.render("admin/profile/index", {
      title: "Your Profile",
      layout: "admin/layout",
      user,
    });
  } catch (error) {
    console.error("Profile page error:", error);
    req.flash("error", "Error loading profile");
    res.redirect("/admin");
  }
});

// Update profile page
router.get("/profile/edit", requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.user.id);

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin");
    }

    res.render("admin/profile/edit", {
      title: "Edit Profile",
      layout: "admin/layout",
      user,
    });
  } catch (error) {
    console.error("Edit profile page error:", error);
    req.flash("error", "Error loading profile edit page");
    res.redirect("/admin");
  }
});

// Update profile
router.post(
  "/profile/update",
  requireAdmin,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const { name, email } = req.body;
      const user = await User.findByPk(req.session.user.id);

      if (!user) {
        req.flash("error", "User not found");
        return res.redirect("/admin");
      }

      // Validate input
      if (!name || name.trim().length < 2 || name.trim().length > 50) {
        req.flash("error", "Name must be between 2 and 50 characters");
        return res.redirect("/admin/profile/edit");
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        req.flash("error", "Please provide a valid email address");
        return res.redirect("/admin/profile/edit");
      }

      // Check if email is already taken by another user
      if (email.toLowerCase() !== user.email.toLowerCase()) {
        const existingUser = await User.findOne({
          where: { email: email.toLowerCase() },
        });
        if (existingUser) {
          req.flash("error", "Email is already taken by another user");
          return res.redirect("/admin/profile/edit");
        }
      }

      // Prepare update data
      const updateData = {
        name: name.trim(),
        email: email.toLowerCase(),
      };

      // Handle avatar upload
      if (req.file) {
        // Save the file path relative to the public directory
        updateData.avatar = `/uploads/${req.file.filename}`;
      }

      await user.update(updateData);

      // Update session user data
      req.session.user.name = name.trim();
      req.session.user.email = email.toLowerCase();

      // Update avatar in session if it was changed
      if (req.file) {
        req.session.user.avatar = `/uploads/${req.file.filename}`;
      }

      req.flash("success", "Profile updated successfully!");
      res.redirect("/admin/profile");
    } catch (error) {
      console.error("Update profile error:", error);
      req.flash("error", "Error updating profile: " + error.message);
      res.redirect("/admin/profile/edit");
    }
  }
);

// Change password page
router.get("/profile/change-password", requireAdmin, (req, res) => {
  res.render("admin/change-password", {
    title: "Change Password",
    layout: "admin/layout",
  });
});

// Change password
router.post("/profile/change-password", requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || currentPassword.length < 1) {
      req.flash("error", "Please enter your current password");
      return res.redirect("/admin/profile/change-password");
    }

    if (!newPassword || newPassword.length < 6) {
      req.flash("error", "New password must be at least 6 characters");
      return res.redirect("/admin/profile/change-password");
    }

    if (newPassword !== confirmPassword) {
      req.flash("error", "New passwords do not match");
      return res.redirect("/admin/profile/change-password");
    }

    // Check if new password is different from current password
    if (currentPassword === newPassword) {
      req.flash(
        "error",
        "New password must be different from current password"
      );
      return res.redirect("/admin/profile/change-password");
    }

    const user = await User.findByPk(req.session.user.id, {
      attributes: { include: ["password"] },
    });

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin");
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      req.flash("error", "Current password is incorrect");
      return res.redirect("/admin/profile/change-password");
    }

    // Update password
    await user.update({ password: newPassword });

    req.flash("success", "Password changed successfully!");
    res.redirect("/admin/profile");
  } catch (error) {
    console.error("Change password error:", error);
    req.flash("error", "Error changing password: " + error.message);
    res.redirect("/admin/profile/change-password");
  }
});

// Toggle project featured status
router.post("/projects/:id/toggle-featured", requireAdmin, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    await project.update({ featured: !project.featured });
    res.json({
      success: true,
      message: `Project ${
        project.featured ? "removed from" : "marked as"
      } featured`,
      featured: !project.featured,
    });
  } catch (error) {
    console.error("Toggle featured error:", error);
    res.status(500).json({ success: false, message: "Error updating project" });
  }
});

// Toggle project visibility
router.post(
  "/projects/:id/toggle-visibility",
  requireAdmin,
  async (req, res) => {
    try {
      const project = await Project.findByPk(req.params.id);
      if (!project) {
        return res
          .status(404)
          .json({ success: false, message: "Project not found" });
      }

      await project.update({ isPublic: !project.isPublic });
      res.json({
        success: true,
        message: `Project made ${project.isPublic ? "private" : "public"}`,
        isPublic: !project.isPublic,
      });
    } catch (error) {
      console.error("Toggle visibility error:", error);
      res
        .status(500)
        .json({ success: false, message: "Error updating project" });
    }
  }
);

// ================== SKILLS MANAGEMENT ==================

// Skills list
router.get("/skills", requireAdmin, async (req, res) => {
  try {
    const skills = await Skill.findAll({
      order: [
        ["category", "ASC"],
        ["order", "ASC"],
      ],
    });

    // Group skills by category
    const groupedSkills = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    res.render("admin/skills/index", {
      title: "Manage Skills",
      layout: "admin/layout",
      groupedSkills,
      totalCount: skills.length,
    });
  } catch (error) {
    console.error("Admin skills error:", error);
    req.flash("error", "Error loading skills");
    res.redirect("/admin");
  }
});

// New skill form
router.get("/skills/new", requireAdmin, (req, res) => {
  res.render("admin/skills/form", {
    title: "Add New Skill",
    layout: "admin/layout",
    skill: {},
    action: "/admin/skills",
    method: "POST",
  });
});

// Create skill
router.post("/skills", requireAdmin, validateSkill, async (req, res) => {
  try {
    // Log the incoming data for debugging
    console.log("Incoming skill data:", req.body);

    await Skill.create(req.body);
    req.flash("success", "Skill created successfully!");
    res.redirect("/admin/skills");
  } catch (error) {
    console.error("Create skill error:", error);
    req.flash("error", "Error creating skill: " + error.message);
    res.render("admin/skills/form", {
      title: "Add New Skill",
      layout: "admin/layout",
      skill: req.body,
      action: "/admin/skills",
      method: "POST",
    });
  }
});

// Edit skill form
router.get("/skills/:id/edit", requireAdmin, async (req, res) => {
  try {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill) {
      req.flash("error", "Skill not found");
      return res.redirect("/admin/skills");
    }

    res.render("admin/skills/form", {
      title: "Edit Skill",
      layout: "admin/layout",
      skill,
      action: `/admin/skills/${skill.id}`,
      method: "PUT",
    });
  } catch (error) {
    console.error("Edit skill error:", error);
    req.flash("error", "Error loading skill");
    res.redirect("/admin/skills");
  }
});

// Update skill
router.put("/skills/:id", requireAdmin, validateSkill, async (req, res) => {
  try {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill) {
      req.flash("error", "Skill not found");
      return res.redirect("/admin/skills");
    }

    await skill.update(req.body);
    req.flash("success", "Skill updated successfully!");
    res.redirect("/admin/skills");
  } catch (error) {
    console.error("Update skill error:", error);
    req.flash("error", "Error updating skill: " + error.message);
    res.redirect("/admin/skills");
  }
});

// Delete skill
router.delete("/skills/:id", requireAdmin, async (req, res) => {
  try {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill) {
      req.flash("error", "Skill not found");
      return res.redirect("/admin/skills");
    }

    await skill.destroy();
    req.flash("success", "Skill deleted successfully!");
    res.redirect("/admin/skills");
  } catch (error) {
    console.error("Delete skill error:", error);
    req.flash("error", "Error deleting skill: " + error.message);
    res.redirect("/admin/skills");
  }
});

// API endpoint for instant proficiency update
router.post(
  "/skills/:id/update-proficiency",
  requireAdmin,
  async (req, res) => {
    try {
      const { proficiency } = req.body;
      const skill = await Skill.findByPk(req.params.id);

      if (!skill) {
        return res
          .status(404)
          .json({ success: false, message: "Skill not found" });
      }

      // Validate proficiency
      if (proficiency < 1 || proficiency > 100) {
        return res.status(400).json({
          success: false,
          message: "Proficiency must be between 1 and 100",
        });
      }

      await skill.update({ proficiency });

      res.json({
        success: true,
        message: "Proficiency updated successfully",
        proficiency: skill.proficiency,
      });
    } catch (error) {
      console.error("Update proficiency error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating proficiency: " + error.message,
      });
    }
  }
);

// API endpoint for toggling visibility
router.post("/skills/:id/toggle-visibility", requireAdmin, async (req, res) => {
  try {
    const skill = await Skill.findByPk(req.params.id);

    if (!skill) {
      return res
        .status(404)
        .json({ success: false, message: "Skill not found" });
    }

    await skill.update({ isVisible: !skill.isVisible });

    res.json({
      success: true,
      message: `Skill ${skill.isVisible ? "hidden" : "shown"} successfully`,
      isVisible: skill.isVisible,
    });
  } catch (error) {
    console.error("Toggle visibility error:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling visibility: " + error.message,
    });
  }
});

// ================== BLOG MANAGEMENT ==================

// Blog posts list
router.get("/blog", requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { count, rows: blogs } = await Blog.findAndCountAll({
      include: [{ model: User, as: "author", attributes: ["name"] }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.render("admin/blog/index", {
      title: "Manage Blog Posts",
      layout: "admin/layout",
      blogs,
      currentPage: page,
      totalPages,
      totalCount: count,
    });
  } catch (error) {
    console.error("Admin blog error:", error);
    req.flash("error", "Error loading blog posts");
    res.redirect("/admin");
  }
});

// Test route for debugging
router.get("/test", requireAdmin, (req, res) => {
  res.send("Admin test route working!");
});

// Test blog form route
router.get("/blog/test", requireAdmin, (req, res) => {
  res.render("admin/blog/test", {
    title: "Test Blog Form",
  });
});

// New blog form
router.get("/blog/new", requireAdmin, (req, res) => {
  try {
    console.log("Rendering new blog form");
    console.log("User:", req.session.user);
    res.render(
      "admin/blog/form",
      {
        title: "Write New Blog Post",
        layout: "admin/layout",
        blog: {},
        action: "/admin/blog",
        method: "POST",
      },
      (err, html) => {
        if (err) {
          console.error("Error rendering blog form:", err);
          req.flash("error", "Error loading blog form: " + err.message);
          return res.redirect("/admin/blog");
        }
        console.log("Successfully rendered blog form");
        res.send(html);
      }
    );
  } catch (error) {
    console.error("Error in blog form route:", error);
    req.flash("error", "Error loading blog form: " + error.message);
    res.redirect("/admin/blog");
  }
});

// Create blog
router.post("/blog", requireAdmin, validateBlog, async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      authorId: req.session.user.id,
    };

    // Set publishedAt if status is published
    if (blogData.status === "published" && !blogData.publishedAt) {
      blogData.publishedAt = new Date();
    }

    // Handle tags if provided as string
    if (typeof blogData.tags === "string") {
      blogData.tags = blogData.tags.split(",").map((t) => t.trim());
    }

    const blog = await Blog.create(blogData);

    // Flash appropriate message based on status
    if (blog.status === "published") {
      req.flash("success", "Blog post published successfully!");
    } else {
      req.flash("success", "Blog post saved as draft!");
    }

    res.redirect("/admin/blog");
  } catch (error) {
    console.error("Create blog error:", error);
    req.flash("error", "Error creating blog post: " + error.message);
    res.render("admin/blog/form", {
      title: "Write New Blog Post",
      layout: "admin/layout",
      blog: req.body,
      action: "/admin/blog",
      method: "POST",
    });
  }
});

// Edit blog form
router.get("/blog/:id/edit", requireAdmin, async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      req.flash("error", "Blog post not found");
      return res.redirect("/admin/blog");
    }

    res.render("admin/blog/form", {
      title: "Edit Blog Post",
      layout: "admin/layout",
      blog,
      action: `/admin/blog/${blog.id}`,
      method: "PUT",
    });
  } catch (error) {
    console.error("Edit blog error:", error);
    req.flash("error", "Error loading blog post");
    res.redirect("/admin/blog");
  }
});

// Update blog
router.put("/blog/:id", requireAdmin, validateBlog, async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      req.flash("error", "Blog post not found");
      return res.redirect("/admin/blog");
    }

    const blogData = { ...req.body };

    // Set publishedAt if status is changing to published
    if (blogData.status === "published" && !blog.publishedAt) {
      blogData.publishedAt = new Date();
    }

    // Handle tags if provided as string
    if (typeof blogData.tags === "string") {
      blogData.tags = blogData.tags.split(",").map((t) => t.trim());
    }

    await blog.update(blogData);

    // Flash appropriate message based on status
    if (blogData.status === "published") {
      req.flash("success", "Blog post published successfully!");
    } else {
      req.flash("success", "Blog post updated successfully!");
    }

    res.redirect("/admin/blog");
  } catch (error) {
    console.error("Update blog error:", error);
    req.flash("error", "Error updating blog post: " + error.message);
    res.redirect("/admin/blog");
  }
});

// Delete blog
router.delete("/blog/:id", requireAdmin, async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      req.flash("error", "Blog post not found");
      return res.redirect("/admin/blog");
    }

    await blog.destroy();
    req.flash("success", "Blog post deleted successfully!");
    res.redirect("/admin/blog");
  } catch (error) {
    console.error("Delete blog error:", error);
    req.flash("error", "Error deleting blog post");
    res.redirect("/admin/blog");
  }
});

// ================== CONTACT MANAGEMENT ==================

// Contacts list
router.get("/contacts", requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    let where = {};
    if (req.query.status) {
      where.status = req.query.status;
    }

    const { count, rows: contacts } = await Contact.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.render("admin/contacts/index", {
      title: "Manage Contacts",
      layout: "admin/layout",
      contacts,
      currentPage: page,
      totalPages,
      totalCount: count,
      selectedStatus: req.query.status || "",
    });
  } catch (error) {
    console.error("Admin contacts error:", error);
    req.flash("error", "Error loading contacts");
    res.redirect("/admin");
  }
});

// View contact
router.get("/contacts/:id", requireAdmin, async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      req.flash("error", "Contact not found");
      return res.redirect("/admin/contacts");
    }

    // Mark as read if it's new
    if (contact.status === "new") {
      await contact.update({ status: "read" });
    }

    res.render("admin/contacts/view", {
      title: "Contact Details",
      layout: "admin/layout",
      contact,
    });
  } catch (error) {
    console.error("View contact error:", error);
    req.flash("error", "Error loading contact");
    res.redirect("/admin/contacts");
  }
});

// Update contact status
router.put("/contacts/:id", requireAdmin, async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      req.flash("error", "Contact not found");
      return res.redirect("/admin/contacts");
    }

    const { status, priority, notes } = req.body;
    const updateData = {};

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes;

    if (status === "replied" && !contact.replied) {
      updateData.replied = true;
      updateData.repliedAt = new Date();
    }

    await contact.update(updateData);
    req.flash("success", "Contact updated successfully!");
    res.redirect("/admin/contacts");
  } catch (error) {
    console.error("Update contact error:", error);
    req.flash("error", "Error updating contact");
    res.redirect("/admin/contacts");
  }
});

// Delete contact
router.delete("/contacts/:id", requireAdmin, async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      req.flash("error", "Contact not found");
      return res.redirect("/admin/contacts");
    }

    await contact.destroy();
    req.flash("success", "Contact deleted successfully!");
    res.redirect("/admin/contacts");
  } catch (error) {
    console.error("Delete contact error:", error);
    req.flash("error", "Error deleting contact");
    res.redirect("/admin/contacts");
  }
});

module.exports = router;
