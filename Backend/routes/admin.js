const express = require("express");
const { User, Project, Skill, Blog, Contact } = require("../models");
const { protect, authorize } = require("../middleware/auth");
const {
  validateProject,
  validateSkill,
  validateBlog,
} = require("../utils/validation");

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    req.flash("error", "Access denied. Admin privileges required.");
    return res.redirect("/admin/login");
  }
  next();
};

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
    const projectData = { ...req.body };
    if (typeof projectData.technologies === "string") {
      projectData.technologies = projectData.technologies
        .split(",")
        .map((t) => t.trim());
    }

    await Project.create(projectData);
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

// Update project
router.put("/projects/:id", requireAdmin, validateProject, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      req.flash("error", "Project not found");
      return res.redirect("/admin/projects");
    }

    const projectData = { ...req.body };
    if (typeof projectData.technologies === "string") {
      projectData.technologies = projectData.technologies
        .split(",")
        .map((t) => t.trim());
    }

    await project.update(projectData);
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
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      req.flash("error", "Project not found");
      return res.redirect("/admin/projects");
    }

    await project.destroy();
    req.flash("success", "Project deleted successfully!");
    res.redirect("/admin/projects");
  } catch (error) {
    console.error("Delete project error:", error);
    req.flash("error", "Error deleting project");
    res.redirect("/admin/projects");
  }
});

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
    await Skill.create(req.body);
    req.flash("success", "Skill created successfully!");
    res.redirect("/admin/skills");
  } catch (error) {
    console.error("Create skill error:", error);
    req.flash("error", "Error creating skill");
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
    req.flash("error", "Error updating skill");
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
    req.flash("error", "Error deleting skill");
    res.redirect("/admin/skills");
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

// New blog form
router.get("/blog/new", requireAdmin, (req, res) => {
  res.render("admin/blog/form", {
    title: "Write New Blog Post",
    layout: "admin/layout",
    blog: {},
    action: "/admin/blog",
    method: "POST",
  });
});

// Create blog
router.post("/blog", requireAdmin, validateBlog, async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      authorId: req.session.user.id,
    };

    if (typeof blogData.tags === "string") {
      blogData.tags = blogData.tags.split(",").map((t) => t.trim());
    }

    await Blog.create(blogData);
    req.flash("success", "Blog post created successfully!");
    res.redirect("/admin/blog");
  } catch (error) {
    console.error("Create blog error:", error);
    req.flash("error", "Error creating blog post");
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
    if (typeof blogData.tags === "string") {
      blogData.tags = blogData.tags.split(",").map((t) => t.trim());
    }

    await blog.update(blogData);
    req.flash("success", "Blog post updated successfully!");
    res.redirect("/admin/blog");
  } catch (error) {
    console.error("Update blog error:", error);
    req.flash("error", "Error updating blog post");
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
