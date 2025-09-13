const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Project = sequelize.define(
  "Project",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide a project title" },
        len: {
          args: [1, 100],
          msg: "Title cannot be more than 100 characters",
        },
      },
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide a project description" },
        len: {
          args: [1, 500],
          msg: "Description cannot be more than 500 characters",
        },
      },
    },
    longDescription: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [0, 2000],
          msg: "Long description cannot be more than 2000 characters",
        },
      },
    },
    technologies: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: { msg: "At least one technology is required" },
      },
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    liveUrl: {
      type: DataTypes.STRING,
      validate: {
        isUrl: { msg: "Please provide a valid URL" },
      },
    },
    githubUrl: {
      type: DataTypes.STRING,
      validate: {
        isUrl: { msg: "Please provide a valid URL" },
      },
    },
    category: {
      type: DataTypes.ENUM("web", "mobile", "desktop", "api", "other"),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide a project category" },
      },
    },
    status: {
      type: DataTypes.ENUM("planning", "in-progress", "completed", "on-hold"),
      defaultValue: "planning",
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    startDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    endDate: {
      type: DataTypes.DATE,
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "projects",
    indexes: [
      {
        fields: ["category", "featured", "order"],
      },
    ],
  }
);

module.exports = Project;
