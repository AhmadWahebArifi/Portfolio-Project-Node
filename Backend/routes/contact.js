const express = require("express");
const Contact = require("../models/Contact");
const { protect, authorize } = require("../middleware/auth");
const { validateContactForm } = require("../utils/validation");
const {
  sendContactNotification,
  sendContactAutoReply,
} = require("../utils/email");

const router = express.Router();

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit contact form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error
 */
router.post("/", validateContactForm, async (req, res) => {
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

    // Send notification email to admin (optional - only if email is configured)
    try {
      if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
        await sendContactNotification(contact);
        await sendContactAutoReply(contact);
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message:
        "Your message has been sent successfully! I will get back to you soon.",
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      message:
        "There was an error sending your message. Please try again later.",
    });
  }
});

/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: Get all contact messages (Admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, read, replied, closed]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, normal, high, urgent]
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
 *         description: Contact messages retrieved successfully
 *       401:
 *         description: Not authorized
 */
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Execute query
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Contact.countDocuments(query);

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
      count: contacts.length,
      total,
      pagination,
      data: contacts,
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/contact/{id}:
 *   get:
 *     summary: Get single contact message (Admin only)
 *     tags: [Contact]
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
 *         description: Contact message retrieved successfully
 *       404:
 *         description: Contact message not found
 */
router.get("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    // Mark as read if it's new
    if (contact.status === "new") {
      contact.status = "read";
      await contact.save();
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Get contact error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/contact/{id}:
 *   put:
 *     summary: Update contact message status (Admin only)
 *     tags: [Contact]
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, read, replied, closed]
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high, urgent]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact message updated successfully
 */
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const { status, priority, notes } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    // Update fields
    if (status) contact.status = status;
    if (priority) contact.priority = priority;
    if (notes !== undefined) contact.notes = notes;

    // Set replied timestamp if status is replied
    if (status === "replied" && !contact.replied) {
      contact.replied = true;
      contact.repliedAt = new Date();
    }

    await contact.save();

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/contact/{id}:
 *   delete:
 *     summary: Delete contact message (Admin only)
 *     tags: [Contact]
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
 *         description: Contact message deleted successfully
 */
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
