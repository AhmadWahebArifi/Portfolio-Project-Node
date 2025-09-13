const { sequelize } = require("../config/database");

// Import all models
const User = require("./User");
const Project = require("./Project");
const Skill = require("./Skill");
const Blog = require("./Blog");
const Contact = require("./Contact");

// Define associations
Blog.belongsTo(User, {
  foreignKey: "authorId",
  as: "author",
});

User.hasMany(Blog, {
  foreignKey: "authorId",
  as: "blogs",
});

// Export all models
module.exports = {
  sequelize,
  User,
  Project,
  Skill,
  Blog,
  Contact,
};
