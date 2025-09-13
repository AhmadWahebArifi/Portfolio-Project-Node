const { User, Project, Skill, Blog } = require("./models");

async function seedAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { email: "admin@portfolio.com" },
    });

    if (!existingAdmin) {
      const adminUser = await User.create({
        name: "Admin User",
        email: "admin@portfolio.com",
        password: "admin123",
        role: "admin",
      });
      console.log("✅ Admin user created successfully!");
      console.log("📧 Email: admin@portfolio.com");
      console.log("🔑 Password: admin123");
    } else {
      console.log("ℹ️  Admin user already exists");
    }

    // Create sample data if tables are empty
    const projectCount = await Project.count();
    const skillCount = await Skill.count();

    if (projectCount === 0) {
      // Create sample projects
      await Project.bulkCreate([
        {
          title: "Portfolio Website",
          description:
            "A responsive portfolio website built with React and Node.js",
          longDescription:
            "This is a comprehensive portfolio website that showcases my projects, skills, and experience. Built with modern technologies including React for the frontend and Node.js with Express for the backend.",
          technologies: ["React", "Node.js", "Express", "MySQL", "Bootstrap"],
          category: "web",
          status: "completed",
          featured: true,
          isPublic: true,
          liveUrl: "https://example.com",
          githubUrl: "https://github.com/example/portfolio",
          order: 1,
        },
        {
          title: "E-commerce API",
          description: "RESTful API for an e-commerce platform",
          longDescription:
            "A comprehensive e-commerce API with features like user authentication, product management, shopping cart, and payment processing.",
          technologies: ["Node.js", "Express", "MongoDB", "JWT", "Stripe"],
          category: "api",
          status: "completed",
          featured: true,
          isPublic: true,
          githubUrl: "https://github.com/example/ecommerce-api",
          order: 2,
        },
        {
          title: "Task Management App",
          description: "A collaborative task management application",
          longDescription:
            "A full-stack task management application that allows teams to collaborate on projects, assign tasks, and track progress.",
          technologies: ["Vue.js", "Node.js", "PostgreSQL", "Socket.io"],
          category: "web",
          status: "in-progress",
          featured: false,
          isPublic: true,
          order: 3,
        },
      ]);
      console.log("✅ Sample projects created!");
    }

    if (skillCount === 0) {
      // Create sample skills
      await Skill.bulkCreate([
        {
          name: "JavaScript",
          category: "frontend",
          proficiency: 90,
          yearsOfExperience: 3,
          icon: "fab fa-js-square",
          color: "#f7df1e",
          description:
            "Expert in modern JavaScript ES6+, async/await, and functional programming",
          order: 1,
          isVisible: true,
        },
        {
          name: "React",
          category: "frontend",
          proficiency: 85,
          yearsOfExperience: 2,
          icon: "fab fa-react",
          color: "#61dafb",
          description:
            "Proficient in React hooks, context API, and state management",
          order: 2,
          isVisible: true,
        },
        {
          name: "Node.js",
          category: "backend",
          proficiency: 80,
          yearsOfExperience: 2,
          icon: "fab fa-node-js",
          color: "#339933",
          description: "Experienced in building scalable backend applications",
          order: 1,
          isVisible: true,
        },
        {
          name: "MySQL",
          category: "database",
          proficiency: 75,
          yearsOfExperience: 2,
          icon: "fas fa-database",
          color: "#4479a1",
          description: "Skilled in database design, optimization, and queries",
          order: 1,
          isVisible: true,
        },
        {
          name: "Git",
          category: "tools",
          proficiency: 85,
          yearsOfExperience: 3,
          icon: "fab fa-git-alt",
          color: "#f05032",
          description:
            "Version control, branching strategies, and collaboration",
          order: 1,
          isVisible: true,
        },
      ]);
      console.log("✅ Sample skills created!");
    }

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

module.exports = seedAdminUser;

// Run if called directly
if (require.main === module) {
  const { connectDB } = require("./config/database");

  async function run() {
    await connectDB();
    await seedAdminUser();
    process.exit(0);
  }

  run();
}
