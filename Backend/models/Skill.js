const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a skill name"],
      trim: true,
      unique: true,
      maxlength: [50, "Skill name cannot be more than 50 characters"],
    },
    category: {
      type: String,
      required: [true, "Please provide a skill category"],
      enum: [
        "frontend",
        "backend",
        "database",
        "devops",
        "tools",
        "soft-skills",
        "other",
      ],
    },
    proficiency: {
      type: Number,
      required: [true, "Please provide proficiency level"],
      min: [1, "Proficiency must be at least 1"],
      max: [100, "Proficiency cannot exceed 100"],
    },
    icon: {
      type: String, // URL or icon class name
      default: "",
    },
    color: {
      type: String,
      default: "#3498db",
    },
    yearsOfExperience: {
      type: Number,
      min: [0, "Years of experience cannot be negative"],
      default: 0,
    },
    description: {
      type: String,
      maxlength: [300, "Description cannot be more than 300 characters"],
    },
    order: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
skillSchema.index({ category: 1, order: 1 });

module.exports = mongoose.model("Skill", skillSchema);
