import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.profile.upsert({
    where: { id: "default-qa-profile" },
    update: {},
    create: {
      id: "default-qa-profile",
      name: "Alex Morgan",
      title: "QA Automation Engineer",
      bio: "QA Automation Engineer focused on building reliable, maintainable test systems. I help teams ship with confidence through thoughtful test strategy, end-to-end automation, and clear quality metrics.",
      avatarUrl: null,
      resumeUrl: null,
      githubUrl: "https://github.com/",
      linkedinUrl: "https://www.linkedin.com/",
      email: "alex.morgan@example.com",
    },
  });

  const skills = [
    { name: "Playwright", category: "Test Automation" },
    { name: "Cypress", category: "Test Automation" },
    { name: "Selenium", category: "Test Automation" },
    { name: "TypeScript", category: "Programming" },
    { name: "Python", category: "Programming" },
    { name: "GitHub Actions", category: "CI/CD" },
    { name: "Docker", category: "DevOps" },
    { name: "Postman", category: "API Testing" },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: {
        name_category: { name: skill.name, category: skill.category },
      },
      update: {},
      create: skill,
    });
  }

  const projects = [
    {
      id: "ecommerce-regression-suite",
      title: "E-commerce Regression Suite",
      description:
        "Built a cross-browser end-to-end suite covering customer journeys including search, cart, checkout, and order confirmation. Added reusable fixtures and stable test data setup.",
      imageUrl: null,
      tools: JSON.stringify(["Playwright", "TypeScript", "GitHub Actions"]),
      metrics: JSON.stringify([
        "Reduced regression time by 70%",
        "Covered 120+ critical user scenarios",
        "Runs across 3 browser engines",
      ]),
      githubUrl: "https://github.com/",
      demoUrl: null,
      featured: true,
    },
    {
      id: "api-contract-validation",
      title: "API Contract Validation",
      description:
        "Created an automated API validation workflow for a booking platform, checking response schemas, authentication, error handling, and key business rules on every pull request.",
      imageUrl: null,
      tools: JSON.stringify(["Postman", "Python", "Docker"]),
      metrics: JSON.stringify([
        "Validated 85 API endpoints",
        "Cut manual API checks by 60%",
        "Detected breaking changes before release",
      ]),
      githubUrl: "https://github.com/",
      demoUrl: null,
      featured: true,
    },
    {
      id: "continuous-quality-pipeline",
      title: "Continuous Quality Pipeline",
      description:
        "Designed a CI quality pipeline that runs smoke tests on each pull request and a broader regression suite on scheduled builds, with clear artifacts for debugging failures.",
      imageUrl: null,
      tools: JSON.stringify(["Cypress", "TypeScript", "GitHub Actions"]),
      metrics: JSON.stringify([
        "Reduced feedback time from 2 hours to 18 minutes",
        "Automated 95% of release smoke checks",
        "Improved flaky test rate by 40%",
      ]),
      githubUrl: "https://github.com/",
      demoUrl: null,
      featured: true,
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: {},
      create: project,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Database seed failed:", error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
