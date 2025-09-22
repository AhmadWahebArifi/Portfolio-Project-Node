const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Skill = sequelize.define(
  "Skill",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Please provide a skill name" },
        len: {
          args: [1, 50],
          msg: "Skill name cannot be more than 50 characters",
        },
      },
    },
    category: {
      type: DataTypes.ENUM(
        "frontend",
        "backend",
        "database",
        "devops",
        "tools",
        "soft-skills",
        "data-science",
        "security",
        "other"
      ),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide a skill category" },
      },
    },
    proficiency: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: "Proficiency must be at least 1",
        },
        max: {
          args: [100],
          msg: "Proficiency cannot exceed 100",
        },
        notEmpty: { msg: "Please provide proficiency level" },
      },
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: "#3498db",
    },
    yearsOfExperience: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "Years of experience cannot be negative",
        }
      },
    },
    description: {
      type: DataTypes.STRING(300),
      validate: {
        len: {
          args: [0, 300],
          msg: "Description cannot be more than 300 characters",
        },
      },
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "skills",
    indexes: [
      {
        fields: ["category", "order"],
      },
      {
        fields: ["isVisible"],
      },
      {
        fields: ["proficiency"],
      },
      {
        fields: ["category", "isVisible", "proficiency"],
      },
    ],
  }
);

module.exports = Skill;