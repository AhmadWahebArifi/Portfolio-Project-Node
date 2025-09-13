const express = require("express");
const Skill = require("../models/Skill");
const { protect, authorize, optionalAuth } = require("../middleware/auth");
const { validateSkill } = require("../utils/validation");

const router = express.Router();

/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: Get all skills
 *     tags: [Skills]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [frontend, backend, database, devops, tools, soft-skills, other]
 *       - in: query
 *         name: visible
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Skills retrieved successfully
 */
router.get("/", optionalAuth, async (req, res) => {
  try {
    // Build query
    let query = {};

    // Only show visible skills to non-admin users
    if (!req.user || req.user.role !== "admin") {
      query.isVisible = true;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }
    if (
      req.query.visible !== undefined &&
      req.user &&
      req.user.role === "admin"
    ) {
      query.isVisible = req.query.visible === "true";
    }

    const skills = await Skill.find(query).sort({
      category: 1,
      order: 1,
      proficiency: -1,
    });

    // Group skills by category
    const groupedSkills = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
      grouped: groupedSkills,
    });
  } catch (error) {
    console.error("Get skills error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/skills/categories:
 *   get:
 *     summary: Get skills grouped by category
 *     tags: [Skills]
 *     responses:
 *       200:
 *         description: Skills categories retrieved successfully
 */
router.get("/categories", async (req, res) => {
  try {
    const skills = await Skill.find({ isVisible: true }).sort({
      category: 1,
      order: 1,
      proficiency: -1,
    });

    // Group skills by category
    const categories = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get skill categories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/skills/{id}:
 *   get:
 *     summary: Get single skill
 *     tags: [Skills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skill retrieved successfully
 *       404:
 *         description: Skill not found
 */
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    let query = { _id: req.params.id };

    // Only show visible skills to non-admin users
    if (!req.user || req.user.role !== "admin") {
      query.isVisible = true;
    }

    const skill = await Skill.findOne(query);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    res.status(200).json({
      success: true,
      data: skill,
    });
  } catch (error) {
    console.error("Get skill error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/skills:
 *   post:
 *     summary: Create new skill (Admin only)
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - proficiency
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [frontend, backend, database, devops, tools, soft-skills, other]
 *               proficiency:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 100
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               yearsOfExperience:
 *                 type: number
 *               description:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Skill created successfully
 */
router.post(
  "/",
  protect,
  authorize("admin"),
  validateSkill,
  async (req, res) => {
    try {
      const skill = await Skill.create(req.body);

      res.status(201).json({
        success: true,
        data: skill,
      });
    } catch (error) {
      console.error("Create skill error:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Skill with this name already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

/**
 * @swagger
 * /api/skills/{id}:
 *   put:
 *     summary: Update skill (Admin only)
 *     tags: [Skills]
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
 *         description: Skill updated successfully
 */
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    res.status(200).json({
      success: true,
      data: skill,
    });
  } catch (error) {
    console.error("Update skill error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Skill with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/skills/{id}:
 *   delete:
 *     summary: Delete skill (Admin only)
 *     tags: [Skills]
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
 *         description: Skill deleted successfully
 */
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    await skill.deleteOne();

    res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    console.error("Delete skill error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/skills/reorder:
 *   put:
 *     summary: Reorder skills (Admin only)
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skills:
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
 *         description: Skills reordered successfully
 */
router.put("/reorder", protect, authorize("admin"), async (req, res) => {
  try {
    const { skills } = req.body;

    // Update order for each skill
    const updatePromises = skills.map(({ id, order }) =>
      Skill.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Skills reordered successfully",
    });
  } catch (error) {
    console.error("Reorder skills error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/skills/bulk:
 *   post:
 *     summary: Create multiple skills (Admin only)
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Skills created successfully
 */
router.post("/bulk", protect, authorize("admin"), async (req, res) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of skills",
      });
    }

    const createdSkills = await Skill.insertMany(skills);

    res.status(201).json({
      success: true,
      count: createdSkills.length,
      data: createdSkills,
    });
  } catch (error) {
    console.error("Bulk create skills error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
