const { sequelize } = require("./config/database");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("./models/User");
const Project = require("./models/Project");
const Skill = require("./models/Skill");
const Blog = require("./models/Blog");

// Define associations
Blog.belongsTo(User, { foreignKey: "authorId", as: "author" });
User.hasMany(Blog, { foreignKey: "authorId", as: "blogs" });

// Connect to database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL Connected");

    // Sync database
    await sequelize.sync({ force: true }); // This will drop and recreate tables
    console.log("Database synchronized");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

// Sample data
const userData = {
  name: "Admin User",
  email: process.env.ADMIN_EMAIL || "admin@example.com",
  password: process.env.ADMIN_PASSWORD || "admin123456",
  role: "admin",
  avatar: "https://via.placeholder.com/150",
};

const skillsData = [
  // Frontend
  {
    name: "JavaScript",
    category: "frontend",
    proficiency: 90,
    icon: "fab fa-js-square",
    color: "#f7df1e",
    yearsOfExperience: 3,
  },
  {
    name: "React",
    category: "frontend",
    proficiency: 85,
    icon: "fab fa-react",
    color: "#61dafb",
    yearsOfExperience: 2,
  },
  {
    name: "Vue.js",
    category: "frontend",
    proficiency: 80,
    icon: "fab fa-vuejs",
    color: "#4fc08d",
    yearsOfExperience: 2,
  },
  {
    name: "HTML5",
    category: "frontend",
    proficiency: 95,
    icon: "fab fa-html5",
    color: "#e34f26",
    yearsOfExperience: 4,
  },
  {
    name: "CSS3",
    category: "frontend",
    proficiency: 90,
    icon: "fab fa-css3-alt",
    color: "#1572b6",
    yearsOfExperience: 4,
  },
  {
    name: "TypeScript",
    category: "frontend",
    proficiency: 75,
    icon: "fab fa-js-square",
    color: "#3178c6",
    yearsOfExperience: 1,
  },

  // Backend
  {
    name: "Node.js",
    category: "backend",
    proficiency: 85,
    icon: "fab fa-node-js",
    color: "#339933",
    yearsOfExperience: 2,
  },
  {
    name: "Express.js",
    category: "backend",
    proficiency: 80,
    icon: "fas fa-server",
    color: "#000000",
    yearsOfExperience: 2,
  },
  {
    name: "Python",
    category: "backend",
    proficiency: 75,
    icon: "fab fa-python",
    color: "#3776ab",
    yearsOfExperience: 1,
  },
  {
    name: "PHP",
    category: "backend",
    proficiency: 70,
    icon: "fab fa-php",
    color: "#777bb4",
    yearsOfExperience: 1,
  },

  // Database
  {
    name: "MySQL",
    category: "database",
    proficiency: 85,
    icon: "fas fa-database",
    color: "#4479a1",
    yearsOfExperience: 3,
  },
  {
    name: "MongoDB",
    category: "database",
    proficiency: 80,
    icon: "fas fa-database",
    color: "#47a248",
    yearsOfExperience: 2,
  },
  {
    name: "PostgreSQL",
    category: "database",
    proficiency: 65,
    icon: "fas fa-database",
    color: "#336791",
    yearsOfExperience: 1,
  },

  // DevOps & Tools
  {
    name: "Git",
    category: "tools",
    proficiency: 85,
    icon: "fab fa-git-alt",
    color: "#f05032",
    yearsOfExperience: 3,
  },
  {
    name: "Docker",
    category: "devops",
    proficiency: 70,
    icon: "fab fa-docker",
    color: "#2496ed",
    yearsOfExperience: 1,
  },
  {
    name: "AWS",
    category: "devops",
    proficiency: 65,
    icon: "fab fa-aws",
    color: "#232f3e",
    yearsOfExperience: 1,
  },
  {
    name: "VS Code",
    category: "tools",
    proficiency: 90,
    icon: "fas fa-code",
    color: "#007acc",
    yearsOfExperience: 3,
  },
];

const projectsData = [
  {
    title: "E-Commerce Platform",
    description:
      "A full-stack e-commerce platform with React frontend and Node.js backend",
    longDescription:
      "This is a comprehensive e-commerce platform built with modern technologies. It features user authentication, product management, shopping cart, payment integration, and admin dashboard. The frontend is built with React and styled with Tailwind CSS, while the backend uses Node.js, Express, and MySQL.",
    technologies: [
      "React",
      "Node.js",
      "MySQL",
      "Express",
      "Tailwind CSS",
      "Stripe",
    ],
    category: "web",
    status: "completed",
    featured: true,
    liveUrl: "https://example-ecommerce.com",
    githubUrl: "https://github.com/username/ecommerce-platform",
    images: [
      {
        url: "https://via.placeholder.com/800x600",
        alt: "E-commerce homepage",
      },
      {
        url: "https://via.placeholder.com/800x600",
        alt: "Product listing page",
      },
    ],
    order: 1,
  },
  {
    title: "Task Management App",
    description:
      "A collaborative task management application with real-time updates",
    longDescription:
      "A modern task management application that allows teams to collaborate effectively. Features include real-time updates, drag-and-drop interface, file attachments, comments, and notifications.",
    technologies: ["Vue.js", "Socket.io", "Node.js", "MySQL", "Vuetify"],
    category: "web",
    status: "completed",
    featured: true,
    liveUrl: "https://example-taskapp.com",
    githubUrl: "https://github.com/username/task-manager",
    images: [
      { url: "https://via.placeholder.com/800x600", alt: "Task dashboard" },
    ],
    order: 2,
  },
  {
    title: "Weather App",
    description:
      "A mobile-responsive weather application with location-based forecasts",
    longDescription:
      "A beautiful weather application that provides current weather conditions and forecasts. Features include location detection, multiple city search, weather maps, and notifications.",
    technologies: ["React Native", "OpenWeather API", "Redux", "Expo"],
    category: "mobile",
    status: "completed",
    featured: false,
    githubUrl: "https://github.com/username/weather-app",
    images: [
      {
        url: "https://via.placeholder.com/400x800",
        alt: "Weather app screenshot",
      },
    ],
    order: 3,
  },
];

const blogData = [
  {
    title: "Getting Started with React Hooks",
    slug: "getting-started-with-react-hooks",
    excerpt:
      "Learn the basics of React Hooks and how they can simplify your React components.",
    content: `
# Getting Started with React Hooks

React Hooks have revolutionized the way we write React components. In this article, we'll explore the basics of React Hooks and how they can simplify your React development.

## What are React Hooks?

React Hooks are functions that let you "hook into" React state and lifecycle features from function components. They were introduced in React 16.8 and have become the preferred way to write React components.

## The useState Hook

The useState Hook is the most commonly used hook. It allows you to add state to function components:

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## The useEffect Hook

The useEffect Hook lets you perform side effects in function components:

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Conclusion

React Hooks provide a more direct API to the React concepts you already know. They make it easier to reuse stateful logic between components and help you organize your code better.
    `,
    category: "web-development",
    tags: ["react", "hooks", "javascript", "frontend"],
    status: "published",
    featured: true,
    publishedAt: new Date(),
    readTime: 5,
  },
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("Creating admin user...");
    const adminUser = await User.create(userData);
    console.log("Admin user created:", adminUser.email);

    console.log("Creating skills...");
    const skills = await Skill.bulkCreate(skillsData);
    console.log(`${skills.length} skills created`);

    console.log("Creating projects...");
    const projects = await Project.bulkCreate(projectsData);
    console.log(`${projects.length} projects created`);

    console.log("Creating blog posts...");
    const blogPosts = blogData.map((post) => ({
      ...post,
      authorId: adminUser.id,
    }));
    const blogs = await Blog.bulkCreate(blogPosts);
    console.log(`${blogs.length} blog posts created`);

    console.log("Database seeded successfully!");
    console.log(`Admin credentials: ${adminUser.email} / ${userData.password}`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

// Run seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
