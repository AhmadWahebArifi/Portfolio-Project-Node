const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a project title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a project description"],
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    longDescription: {
      type: String,
      maxlength: [2000, "Long description cannot be more than 2000 characters"],
    },
    technologies: [
      {
        type: String,
        required: true,
      },
    ],
    images: [
      {
        url: String,
        alt: String,
      },
    ],
    liveUrl: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Please provide a valid URL",
      },
    },
    githubUrl: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Please provide a valid URL",
      },
    },
    category: {
      type: String,
      required: [true, "Please provide a project category"],
      enum: ["web", "mobile", "desktop", "api", "other"],
    },
    status: {
      type: String,
      enum: ["planning", "in-progress", "completed", "on-hold"],
      default: "planning",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
projectSchema.index({ category: 1, featured: -1, order: 1 });

module.exports = mongoose.model("Project", projectSchema);
