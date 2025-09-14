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

// Ahmad's real data
const ahmadUserData = {
  name: "Ahmad Waheb Arifi",
  email: process.env.ADMIN_EMAIL || "ahmadwahebarifi@gmail.com",
  password: process.env.ADMIN_PASSWORD || "admin123456",
  role: "admin",
  avatar: "https://via.placeholder.com/150",
};

// Ahmad's actual skills from resume
const ahmadSkillsData = [
  // Programming Languages
  {
    name: "JavaScript",
    category: "frontend",
    proficiency: 90,
    icon: "fab fa-js-square",
    color: "#f7df1e",
    yearsOfExperience: 3,
    description: "Proficient in modern JavaScript, ES6+, DOM manipulation",
    order: 1,
  },
  {
    name: "Python",
    category: "backend",
    proficiency: 85,
    icon: "fab fa-python",
    color: "#3776ab",
    yearsOfExperience: 2,
    description:
      "Data Science, web development, automation, 100 Days of Code completed",
    order: 1,
  },
  {
    name: "Java",
    category: "backend",
    proficiency: 75,
    icon: "fab fa-java",
    color: "#007396",
    yearsOfExperience: 2,
    description: "Solid foundation in Java programming and OOP concepts",
    order: 2,
  },
  {
    name: "PHP",
    category: "backend",
    proficiency: 80,
    icon: "fab fa-php",
    color: "#777bb4",
    yearsOfExperience: 2,
    description: "LAMP stack development, Laravel framework",
    order: 3,
  },

  // Frontend Technologies
  {
    name: "React.js",
    category: "frontend",
    proficiency: 88,
    icon: "fab fa-react",
    color: "#61dafb",
    yearsOfExperience: 2,
    description:
      "Component-based architecture, hooks, state management, teaching React.js",
    order: 2,
  },
  {
    name: "HTML5",
    category: "frontend",
    proficiency: 95,
    icon: "fab fa-html5",
    color: "#e34f26",
    yearsOfExperience: 4,
    description: "Semantic HTML, accessibility, modern web standards",
    order: 3,
  },
  {
    name: "CSS3",
    category: "frontend",
    proficiency: 90,
    icon: "fab fa-css3-alt",
    color: "#1572b6",
    yearsOfExperience: 4,
    description: "Responsive design, animations, CSS Grid, Flexbox",
    order: 4,
  },
  {
    name: "Tailwind CSS",
    category: "frontend",
    proficiency: 85,
    icon: "fas fa-paint-brush",
    color: "#06b6d4",
    yearsOfExperience: 1,
    description: "Utility-first CSS framework, responsive design",
    order: 5,
  },

  // Backend Technologies
  {
    name: "Laravel",
    category: "backend",
    proficiency: 85,
    icon: "fab fa-laravel",
    color: "#ff2d20",
    yearsOfExperience: 2,
    description: "MVC architecture, Eloquent ORM, RESTful APIs",
    order: 4,
  },
  {
    name: "Node.js",
    category: "backend",
    proficiency: 80,
    icon: "fab fa-node-js",
    color: "#339933",
    yearsOfExperience: 2,
    description: "Server-side JavaScript, Express.js, RESTful APIs",
    order: 5,
  },

  // Databases
  {
    name: "MySQL",
    category: "database",
    proficiency: 90,
    icon: "fas fa-database",
    color: "#4479a1",
    yearsOfExperience: 3,
    description:
      "Database design, optimization, stored procedures, university MIS development",
    order: 1,
  },
  {
    name: "MongoDB",
    category: "database",
    proficiency: 80,
    icon: "fas fa-database",
    color: "#47a248",
    yearsOfExperience: 2,
    description: "NoSQL database, document-based storage, aggregation",
    order: 2,
  },
  {
    name: "SQLite",
    category: "database",
    proficiency: 85,
    icon: "fas fa-database",
    color: "#003b57",
    yearsOfExperience: 2,
    description: "Lightweight database for mobile and desktop applications",
    order: 3,
  },

  // Data Science & Analytics
  {
    name: "NumPy",
    category: "other",
    proficiency: 80,
    icon: "fas fa-chart-line",
    color: "#013243",
    yearsOfExperience: 1,
    description:
      "Array operations, numerical computations, multi-dimensional data",
    order: 1,
  },
  {
    name: "Pandas",
    category: "other",
    proficiency: 85,
    icon: "fas fa-table",
    color: "#150458",
    yearsOfExperience: 1,
    description: "Data cleaning, transformation, and manipulation",
    order: 2,
  },
  {
    name: "Matplotlib",
    category: "other",
    proficiency: 75,
    icon: "fas fa-chart-bar",
    color: "#11557c",
    yearsOfExperience: 1,
    description: "Plotting graphs, charts, and visualizing trends",
    order: 3,
  },
  {
    name: "Seaborn",
    category: "other",
    proficiency: 70,
    icon: "fas fa-chart-area",
    color: "#4c72b0",
    yearsOfExperience: 1,
    description: "Advanced and interactive visualizations",
    order: 4,
  },

  // Tools & DevOps
  {
    name: "Git",
    category: "tools",
    proficiency: 85,
    icon: "fab fa-git-alt",
    color: "#f05032",
    yearsOfExperience: 3,
    description: "Version control, branching, collaboration, GitHub workflows",
    order: 1,
  },
  {
    name: "VS Code",
    category: "tools",
    proficiency: 90,
    icon: "fas fa-code",
    color: "#007acc",
    yearsOfExperience: 3,
    description: "Primary IDE, extensions, debugging, integrated terminal",
    order: 2,
  },
  {
    name: "React Router",
    category: "tools",
    proficiency: 80,
    icon: "fas fa-route",
    color: "#ca4245",
    yearsOfExperience: 1,
    description: "Client-side routing for React applications",
    order: 3,
  },

  // Soft Skills
  {
    name: "Project Management",
    category: "soft-skills",
    proficiency: 85,
    icon: "fas fa-tasks",
    color: "#6c757d",
    yearsOfExperience: 2,
    description: "Agile methodologies, planning, execution, delivery",
    order: 1,
  },
  {
    name: "Communication",
    category: "soft-skills",
    proficiency: 90,
    icon: "fas fa-comments",
    color: "#28a745",
    yearsOfExperience: 3,
    description:
      "Technical writing, presentations, teaching, multilingual (English, Pashto, Dari, Russian, Spanish)",
    order: 2,
  },
  {
    name: "Team Collaboration",
    category: "soft-skills",
    proficiency: 88,
    icon: "fas fa-users",
    color: "#17a2b8",
    yearsOfExperience: 2,
    description: "Teamwork, code reviews, pair programming, mentoring",
    order: 3,
  },
  {
    name: "Problem Solving",
    category: "soft-skills",
    proficiency: 90,
    icon: "fas fa-puzzle-piece",
    color: "#fd7e14",
    yearsOfExperience: 3,
    description: "Analytical thinking, debugging, algorithm design",
    order: 4,
  },

  // Security & Networking
  {
    name: "Information Security",
    category: "other",
    proficiency: 70,
    icon: "fas fa-shield-alt",
    color: "#dc3545",
    yearsOfExperience: 1,
    description: "Security basics, best practices, secure coding",
    order: 5,
  },
  {
    name: "Networking",
    category: "other",
    proficiency: 75,
    icon: "fas fa-network-wired",
    color: "#6f42c1",
    yearsOfExperience: 1,
    description: "Network fundamentals, A+, Network+ concepts",
    order: 6,
  },
];

// Ahmad's actual projects from resume and GitHub
const ahmadProjectsData = [
  {
    title: "KPU MIS (Kabul Polytechnique University)",
    description:
      "Comprehensive Management Information System for university administration and academic processes",
    longDescription:
      "A full-stack MIS solution built for Kabul Polytechnique University, handling student management, academic records, administrative processes, and reporting. Developed as part of university work experience.",
    technologies: [
      "PHP",
      "Laravel",
      "MySQL",
      "JavaScript",
      "Bootstrap",
      "jQuery",
    ],
    category: "web",
    status: "completed",
    featured: true,
    liveUrl: null, // Private system
    githubUrl: null, // Private repository
    images: [
      {
        url: "https://via.placeholder.com/800x600/4CAF50/FFFFFF?text=KPU+MIS",
        alt: "KPU MIS Dashboard",
      },
    ],
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    order: 1,
  },
  {
    title: "KPU Alumni System",
    description:
      "Alumni management and networking platform for Kabul Polytechnique University graduates",
    longDescription:
      "A dedicated platform for managing university alumni, facilitating networking, career tracking, and maintaining connections between graduates and the institution.",
    technologies: ["React.js", "Node.js", "MySQL", "Express.js", "Bootstrap"],
    category: "web",
    status: "in-progress",
    featured: true,
    liveUrl: null, // Private system
    githubUrl: null, // Private repository
    images: [
      {
        url: "https://via.placeholder.com/800x600/2196F3/FFFFFF?text=Alumni+System",
        alt: "Alumni System Interface",
      },
    ],
    startDate: new Date("2025-01-01"),
    order: 2,
  },
  {
    title: "Afghanistan's Province Game",
    description:
      "Python-based interactive geography game for learning Afghanistan's provinces",
    longDescription:
      "An educational game built with Python that helps users learn Afghanistan's geography by guessing provinces on an interactive map. Features include scoring system, hints, and educational content.",
    technologies: ["Python", "Turtle Graphics", "Pandas", "CSV"],
    category: "desktop",
    status: "completed",
    featured: false,
    liveUrl: null,
    githubUrl: "https://github.com/AhmadWahebArifi/Afghanistan-Province-Game",
    images: [
      {
        url: "https://via.placeholder.com/800x600/FF9800/FFFFFF?text=Afghanistan+Map+Game",
        alt: "Afghanistan Province Game Screenshot",
      },
    ],
    startDate: new Date("2024-05-01"),
    endDate: new Date("2024-06-01"),
    order: 3,
  },
  {
    title: "Restaurant Website",
    description:
      "Modern restaurant website with responsive design and interactive features",
    longDescription:
      "A frontend-only restaurant website showcasing modern web development practices with React.js, featuring responsive design, interactive menu, and smooth animations.",
    technologies: ["React.js", "Tailwind CSS", "React Router"],
    category: "web",
    status: "completed",
    featured: false,
    liveUrl: null,
    githubUrl: "https://github.com/AhmadWahebArifi/Restaurant-Website",
    images: [
      {
        url: "https://via.placeholder.com/800x600/E91E63/FFFFFF?text=Restaurant+Website",
        alt: "Restaurant Website Homepage",
      },
    ],
    startDate: new Date("2025-03-01"),
    endDate: new Date("2025-06-01"),
    order: 4,
  },
  {
    title: "Portfolio Website",
    description: "Full-stack portfolio website showcasing projects and skills",
    longDescription:
      "A comprehensive portfolio website built with React frontend and Node.js backend, featuring project showcase, blog functionality, contact forms, and admin dashboard for content management.",
    technologies: [
      "React.js",
      "Node.js",
      "Express.js",
      "MySQL",
      "Bootstrap 5",
      "EJS",
    ],
    category: "web",
    status: "in-progress",
    featured: true,
    liveUrl: null,
    githubUrl: "https://github.com/AhmadWahebArifi/Portfolio-Project",
    images: [
      {
        url: "https://via.placeholder.com/800x600/9C27B0/FFFFFF?text=Portfolio+Website",
        alt: "Portfolio Website",
      },
    ],
    startDate: new Date("2025-01-01"),
    order: 5,
  },
];

// Ahmad's blog posts
const ahmadBlogData = [
  {
    title: "My Journey in Full Stack Development",
    slug: "my-journey-full-stack-development",
    excerpt:
      "From completing high school at 15 to becoming a full-stack developer - my coding journey and lessons learned.",
    content: `
# My Journey in Full Stack Development

Starting my journey in technology at a young age has been both challenging and rewarding. Completing high school at 15 from Mahmoud Tarzi High School was just the beginning of my quest for knowledge.

## University and Real-World Experience

Currently pursuing my Bachelor's degree in Information Systems at KPU, I've had the unique opportunity to apply my learning directly through working as a developer in the university's MIS (Management Information System). This hands-on experience has been invaluable in understanding both the theoretical and practical aspects of software development.

## Technology Stack Evolution

My journey started with the LAMP stack (Linux, Apache, MySQL, PHP), which gave me a solid foundation in web development. As I grew as a developer, I expanded into the MERN stack (MongoDB, Express.js, React.js, Node.js), which opened up new possibilities for creating modern, scalable applications.

### Key Technologies I've Mastered:
- **Frontend**: React.js, JavaScript, HTML5, CSS3, Tailwind CSS
- **Backend**: Laravel, Node.js, Python
- **Databases**: MySQL, MongoDB, SQLite
- **Data Science**: NumPy, Pandas, Matplotlib, Seaborn

## Teaching and Sharing Knowledge

Currently working at Top Target Technology as a React.js instructor, I'm passionate about sharing my knowledge with the next generation of developers. Teaching has not only reinforced my own understanding but also kept me updated with the latest best practices and emerging trends.

## Looking Forward

My interests extend beyond just web development. I'm particularly excited about:
- Artificial Intelligence and Machine Learning
- Data Science applications
- Physics and its intersection with technology
- Creating intelligent, data-driven applications

## Advice for Aspiring Developers

1. **Start Early**: Don't wait for the "perfect" moment to begin learning
2. **Build Real Projects**: Theory is important, but practical application is crucial
3. **Teach Others**: Sharing knowledge solidifies your own understanding
4. **Stay Curious**: Technology evolves rapidly, embrace continuous learning
5. **Focus on Problem-Solving**: Technology is just a tool; the real skill is solving problems

The journey continues, and I'm excited about the future possibilities in technology and beyond.
    `,
    category: "personal",
    tags: ["development", "journey", "education", "career"],
    status: "published",
    featured: true,
    publishedAt: new Date(),
    readTime: 8,
  },
  {
    title: "Building University MIS: Lessons Learned",
    slug: "building-university-mis-lessons-learned",
    excerpt:
      "Key insights and challenges from developing a comprehensive Management Information System for university operations.",
    content: `
# Building University MIS: Lessons Learned

Working on the Kabul Polytechnique University's Management Information System has been one of the most challenging and rewarding projects of my career. Here are the key lessons I've learned from this experience.

## Understanding Complex Requirements

University systems are incredibly complex, involving multiple stakeholders:
- Students and their academic records
- Faculty and course management
- Administrative staff and operations
- Finance and billing systems
- Reporting and analytics needs

## Technical Challenges

### Database Design
Creating a robust database schema that could handle:
- Student enrollment and academic progression
- Course scheduling and conflicts
- Grade management and GPA calculations
- Financial transactions and billing

### Performance Optimization
With thousands of students and hundreds of courses, performance became critical:
- Proper indexing strategies
- Query optimization
- Caching mechanisms
- Efficient data pagination

### Security Considerations
Handling sensitive academic and personal data required:
- Role-based access control
- Data encryption
- Audit trails
- Secure authentication systems

## Technology Stack Decisions

We chose the LAMP stack for several reasons:
- **PHP/Laravel**: Rapid development and excellent documentation
- **MySQL**: Reliable ACID compliance for critical academic data
- **JavaScript**: Interactive frontend features
- **Bootstrap**: Responsive design for various devices

## Key Takeaways

1. **Requirements Gathering is Critical**: Spend time understanding all user workflows
2. **Incremental Development**: Build and test features iteratively
3. **User Feedback is Invaluable**: Regular feedback sessions prevent major rework
4. **Documentation Matters**: Comprehensive documentation saves time later
5. **Testing is Non-Negotiable**: Academic data accuracy is paramount

## Future Improvements

The system continues to evolve with plans for:
- Mobile application development
- Advanced analytics and reporting
- Integration with external systems
- AI-powered insights and recommendations

Building the university MIS has been a masterclass in real-world software development, teaching me valuable lessons about scalability, user experience, and the importance of robust, maintainable code.
    `,
    category: "technical",
    tags: ["mis", "university", "laravel", "database", "development"],
    status: "published",
    featured: false,
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    readTime: 6,
  },
];

// Seed function
const seedAhmadDatabase = async () => {
  try {
    await connectDB();

    console.log("Creating Ahmad's admin user...");
    const ahmadUser = await User.create(ahmadUserData);
    console.log("Ahmad's admin user created:", ahmadUser.email);

    console.log("Creating Ahmad's skills...");
    const skills = await Skill.bulkCreate(ahmadSkillsData);
    console.log(`${skills.length} skills created for Ahmad`);

    console.log("Creating Ahmad's projects...");
    const projects = await Project.bulkCreate(ahmadProjectsData);
    console.log(`${projects.length} projects created for Ahmad`);

    console.log("Creating Ahmad's blog posts...");
    const blogPosts = ahmadBlogData.map((post) => ({
      ...post,
      authorId: ahmadUser.id,
    }));
    const blogs = await Blog.bulkCreate(blogPosts);
    console.log(`${blogs.length} blog posts created for Ahmad`);

    console.log("Ahmad's database seeded successfully!");
    console.log(
      `Admin credentials: ${ahmadUser.email} / ${ahmadUserData.password}`
    );
    console.log("\nSkills Summary:");
    console.log(
      `- Frontend: ${
        skills.filter((s) => s.category === "frontend").length
      } skills`
    );
    console.log(
      `- Backend: ${
        skills.filter((s) => s.category === "backend").length
      } skills`
    );
    console.log(
      `- Database: ${
        skills.filter((s) => s.category === "database").length
      } skills`
    );
    console.log(
      `- Tools: ${skills.filter((s) => s.category === "tools").length} skills`
    );
    console.log(
      `- Soft Skills: ${
        skills.filter((s) => s.category === "soft-skills").length
      } skills`
    );
    console.log(
      `- Other: ${skills.filter((s) => s.category === "other").length} skills`
    );

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

// Run seeder
if (require.main === module) {
  seedAhmadDatabase();
}

module.exports = seedAhmadDatabase;
