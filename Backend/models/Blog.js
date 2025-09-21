const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Blog = sequelize.define(
  "Blog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide a blog title" },
        len: {
          args: [1, 200],
          msg: "Title cannot be more than 200 characters",
        },
      },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    excerpt: {
      type: DataTypes.STRING(300),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide an excerpt" },
        len: {
          args: [1, 300],
          msg: "Excerpt cannot be more than 300 characters",
        },
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide blog content" },
      },
    },
    featuredImage: {
      type: DataTypes.JSON,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    category: {
      type: DataTypes.ENUM(
        "technology",
        "web-development",
        "programming",
        "tutorials",
        "career",
        "personal",
        "other"
      ),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide a category" },
      },
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "archived"),
      defaultValue: "draft",
    },
    publishedAt: {
      type: DataTypes.DATE,
    },
    readTime: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    metaDescription: {
      type: DataTypes.STRING(160),
      validate: {
        len: {
          args: [0, 160],
          msg: "Meta description cannot be more than 160 characters",
        },
      },
    },
    seoKeywords: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    tableName: "blogs",
    indexes: [
      {
        fields: ["status", "publishedAt"],
      },
      {
        fields: ["slug"],
        unique: true,
      },
      {
        fields: ["authorId"],
      },
      {
        fields: ["category"],
      },
      {
        fields: ["featured"],
      },
      {
        fields: ["status", "featured", "publishedAt"],
      },
    ],
    hooks: {
      beforeCreate: (blog) => {
        if (!blog.slug && blog.title) {
          blog.slug = blog.title
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
        }
      },
      beforeUpdate: (blog) => {
        if (blog.changed("title") && !blog.changed("slug")) {
          blog.slug = blog.title
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
        }
      },
    },
  }
);

// Define associations
Blog.associate = (models) => {
  Blog.belongsTo(models.User, {
    foreignKey: "authorId",
    as: "author",
  });
};

module.exports = Blog;
