const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Contact = sequelize.define(
  "Contact",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide your name" },
        len: { args: [1, 50], msg: "Name cannot be more than 50 characters" },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: { msg: "Please provide a valid email" },
        notEmpty: { msg: "Please provide your email" },
      },
      set(value) {
        this.setDataValue("email", value.toLowerCase());
      },
    },
    subject: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide a subject" },
        len: {
          args: [1, 100],
          msg: "Subject cannot be more than 100 characters",
        },
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide a message" },
        len: {
          args: [1, 1000],
          msg: "Message cannot be more than 1000 characters",
        },
      },
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    company: {
      type: DataTypes.STRING(100),
    },
    status: {
      type: DataTypes.ENUM("new", "read", "replied", "closed"),
      defaultValue: "new",
    },
    priority: {
      type: DataTypes.ENUM("low", "normal", "high", "urgent"),
      defaultValue: "normal",
    },
    ipAddress: {
      type: DataTypes.STRING(45),
    },
    userAgent: {
      type: DataTypes.TEXT,
    },
    replied: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    repliedAt: {
      type: DataTypes.DATE,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "contacts",
    indexes: [
      {
        fields: ["status", "priority", "createdAt"],
      },
    ],
  }
);

module.exports = Contact;
