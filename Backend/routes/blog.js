const express = require("express");
const Blog = require("../models/Blog");
const { protect, authorize, optionalAuth } = require("../middleware/auth");
const { validateBlog } = require("../utils/validation");

const router = express.Router();

/**
 * @swagger
 * /api/blog:
 *   get:
 *     summary: Get all blog posts
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [technology, web-development, programming, tutorials, career, personal, other]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
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
 *         description: Blog posts retrieved successfully
 */
router.get("/", optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};

    // Only show published posts to non-admin users
    if (!req.user || req.user.role !== "admin") {
      query.status = "published";
    }

    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.status && req.user && req.user.role === "admin") {
      query.status = req.query.status;
    }
    if (req.query.featured !== undefined) {
      query.featured = req.query.featured === "true";
    }
    if (req.query.tags) {
      query.tags = { $in: req.query.tags.split(",") };
    }
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { excerpt: { $regex: req.query.search, $options: "i" } },
        { content: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Execute query
    const blogs = await Blog.find(query)
      .populate("author", "name email avatar")
      .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .select("-content"); // Exclude full content from list view

    const total = await Blog.countDocuments(query);

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
      count: blogs.length,
      total,
      pagination,
      data: blogs,
    });
  } catch (error) {
    console.error("Get blog posts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/blog/featured:
 *   get:
 *     summary: Get featured blog posts
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: Featured blog posts retrieved successfully
 */
router.get("/featured", async (req, res) => {
  try {
    const blogs = await Blog.find({
      featured: true,
      status: "published",
    })
      .populate("author", "name email avatar")
      .sort({ publishedAt: -1 })
      .limit(3)
      .select("-content");

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    console.error("Get featured blog posts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/blog/{slug}:
 *   get:
 *     summary: Get single blog post by slug
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post retrieved successfully
 *       404:
 *         description: Blog post not found
 */
router.get("/:slug", optionalAuth, async (req, res) => {
  try {
    let query = { slug: req.params.slug };

    // Only show published posts to non-admin users
    if (!req.user || req.user.role !== "admin") {
      query.status = "published";
    }

    const blog = await Blog.findOne(query).populate(
      "author",
      "name email avatar"
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Increment views count
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Get blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/blog:
 *   post:
 *     summary: Create new blog post (Admin only)
 *     tags: [Blog]
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
 *               - excerpt
 *               - content
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               featuredImage:
 *                 type: object
 *               status:
 *                 type: string
 *               featured:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Blog post created successfully
 */
router.post(
  "/",
  protect,
  authorize("admin"),
  validateBlog,
  async (req, res) => {
    try {
      // Set author to current user
      req.body.author = req.user.id;

      // Set published date if status is published
      if (req.body.status === "published" && !req.body.publishedAt) {
        req.body.publishedAt = new Date();
      }

      const blog = await Blog.create(req.body);

      // Populate author information
      await blog.populate("author", "name email avatar");

      res.status(201).json({
        success: true,
        data: blog,
      });
    } catch (error) {
      console.error("Create blog post error:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Blog post with this slug already exists",
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
 * /api/blog/{id}:
 *   put:
 *     summary: Update blog post (Admin only)
 *     tags: [Blog]
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
 *         description: Blog post updated successfully
 */
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Set published date if status is changed to published
    if (
      req.body.status === "published" &&
      blog.status !== "published" &&
      !req.body.publishedAt
    ) {
      req.body.publishedAt = new Date();
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("author", "name email avatar");

    res.status(200).json({
      success: true,
      data: updatedBlog,
    });
  } catch (error) {
    console.error("Update blog post error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Blog post with this slug already exists",
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
 * /api/blog/{id}:
 *   delete:
 *     summary: Delete blog post (Admin only)
 *     tags: [Blog]
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
 *         description: Blog post deleted successfully
 */
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    console.error("Delete blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/blog/{id}/like:
 *   post:
 *     summary: Like a blog post
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post liked successfully
 */
router.post("/:id/like", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    if (blog.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Cannot like unpublished blog post",
      });
    }

    blog.likes += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog post liked successfully",
      likes: blog.likes,
    });
  } catch (error) {
    console.error("Like blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/blog/tags:
 *   get:
 *     summary: Get all unique tags
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 */
router.get("/tags", async (req, res) => {
  try {
    const tags = await Blog.distinct("tags", { status: "published" });

    res.status(200).json({
      success: true,
      data: tags.sort(),
    });
  } catch (error) {
    console.error("Get blog tags error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
