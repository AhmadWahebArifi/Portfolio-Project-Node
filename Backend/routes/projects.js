const express = require("express");
const Project = require("../models/Project");
const { protect, authorize, optionalAuth } = require("../middleware/auth");
const { validateProject } = require("../utils/validation");

const router = express.Router();

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [web, mobile, desktop, api, other]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, in-progress, completed, on-hold]
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 */
router.get("/", optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};

    // Only show public projects to non-admin users
    if (!req.user || req.user.role !== "admin") {
      query.isPublic = true;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.featured !== undefined) {
      query.featured = req.query.featured === "true";
    }

    // Execute query
    const projects = await Project.find(query)
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Project.countDocuments(query);

    // Pagination result
    const pagination = {};

    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      pagination,
      data: projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/projects/featured:
 *   get:
 *     summary: Get featured projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Featured projects retrieved successfully
 */
router.get("/featured", async (req, res) => {
  try {
    const projects = await Project.find({
      featured: true,
      isPublic: true,
    })
      .sort({ order: 1, createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Get featured projects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get single project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       404:
 *         description: Project not found
 */
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    let query = { _id: req.params.id };

    // Only show public projects to non-admin users
    if (!req.user || req.user.role !== "admin") {
      query.isPublic = true;
    }

    const project = await Project.findOne(query);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create new project (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - technologies
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               longDescription:
 *                 type: string
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *                 enum: [web, mobile, desktop, api, other]
 *               liveUrl:
 *                 type: string
 *               githubUrl:
 *                 type: string
 *               images:
 *                 type: array
 *               featured:
 *                 type: boolean
 *               status:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Project created successfully
 */
router.post(
  "/",
  protect,
  authorize("admin"),
  validateProject,
  async (req, res) => {
    try {
      const project = await Project.create(req.body);

      res.status(201).json({
        success: true,
        data: project,
      });
    } catch (error) {
      console.error("Create project error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Project updated successfully
 */
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 */
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/projects/reorder:
 *   put:
 *     summary: Reorder projects (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projects:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     order:
 *                       type: number
 *     responses:
 *       200:
 *         description: Projects reordered successfully
 */
router.put("/reorder", protect, authorize("admin"), async (req, res) => {
  try {
    const { projects } = req.body;

    // Update order for each project
    const updatePromises = projects.map(({ id, order }) =>
      Project.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Projects reordered successfully",
    });
  } catch (error) {
    console.error("Reorder projects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
