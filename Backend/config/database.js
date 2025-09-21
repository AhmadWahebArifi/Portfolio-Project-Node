const { Sequelize } = require("sequelize");

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || "portfolio",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 20, // Increased from 5 to 20
      min: 5, // Increased from 0 to 5
      acquire: 30000,
      idle: 10000,
      evict: 10000, // Add eviction timeout
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false,
    },
    // Add performance optimizations
    benchmark: true,
    retry: {
      max: 3, // Retry failed queries up to 3 times
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL Connected successfully");

    // Sync database - use force only if needed, alter can cause index conflicts
    if (process.env.NODE_ENV === "development") {
      // Use { force: false } to avoid recreating tables and causing index issues
      await sequelize.sync({ force: false });
      console.log("Database synchronized");
    }
  } catch (error) {
    console.error("Database connection error:", error.message);
    // Don't exit process, let the app continue running
    console.log("Continuing without database sync...");
  }
};

module.exports = { sequelize, connectDB };
