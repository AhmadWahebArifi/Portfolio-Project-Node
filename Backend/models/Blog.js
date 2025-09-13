const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a blog title"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      required: [true, "Please provide an excerpt"],
      maxlength: [300, "Excerpt cannot be more than 300 characters"],
    },
    content: {
      type: String,
      required: [true, "Please provide blog content"],
    },
    featuredImage: {
      url: String,
      alt: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      required: [true, "Please provide a category"],
      enum: [
        "technology",
        "web-development",
        "programming",
        "tutorials",
        "career",
        "personal",
        "other",
      ],
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
    },
    readTime: {
      type: Number, // in minutes
      default: 5,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description cannot be more than 160 characters"],
    },
    seoKeywords: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ tags: 1 });

// Generate slug from title before saving
blogSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

module.exports = mongoose.model("Blog", blogSchema);
