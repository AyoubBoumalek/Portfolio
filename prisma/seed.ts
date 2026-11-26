import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.profile.upsert({
    where: { id: "default-qa-profile" },
    update: {},
    create: {
      id: "default-qa-profile",
      name: "Ayoub Boumalek",
      title: "QA Automation Engineer",
      bio: "QA Automation Engineer focused on building reliable, maintainable test systems. I help teams ship with confidence through thoughtful test strategy, end-to-end automation, and clear quality metrics.",
      avatarUrl: null,
      resumeUrl: null,
      githubUrl: "https://github.com/AyoubBoumalek",
      linkedinUrl: "https://www.linkedin.com/",
      email: "boumalekayoub392@gmail.com",
    },
  });

  const skills = [
    { name: "Robot Framework", category: "Test Automation" },
    { name: "Cypress", category: "Test Automation" },
    { name: "Selenium", category: "Test Automation" },
    { name: "Java", category: "Programming" },
    { name: "Python", category: "Programming" },
    { name: "GitHub Actions", category: "CI/CD" },
    { name: "Jenkins", category: "CI/CD" },
    { name: "GitLab", category: "CI/CD" },
    { name: "Docker", category: "DevOps" },
    { name: "Azure DevOps", category: "DevOps" },
    { name: "Postman", category: "API Testing" },
  ];

  await prisma.skill.deleteMany({
    where: {
      OR: [
        { name: "Playwright", category: "Test Automation" },
        { name: "TypeScript", category: "Programming" },
      ],
    },
  });

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
      title: "Swag Labs E-commerce UI Automation",
      description:
        "A Java-based end-to-end UI automation project for the Swag Labs demo store. Selenium WebDriver and TestNG drive a Chrome scenario through login, product selection, cart, checkout, order confirmation, and logout.",
      imageUrl: null,
      tools: JSON.stringify(["Java 16", "Selenium WebDriver", "TestNG", "Maven", "Chrome"]),
      metrics: JSON.stringify([
        "Complete purchase flow from login through logout",
        "Order confirmation and logout are validated",
      ]),
      githubUrl: "https://github.com/AyoubBoumalek/Swag-Labs-Ecommerce-WebSite",
      demoUrl: "https://www.saucedemo.com",
      featured: true,
    },
    {
      id: "api-contract-validation",
      title: "TutorialsNinja Registration Automation",
      description:
        "Robot Framework and SeleniumLibrary UI automation for the TutorialsNinja demo registration form. The suite fills account details, generates email and telephone values, accepts the privacy policy, submits the form, and checks the success route.",
      imageUrl: null,
      tools: JSON.stringify(["Robot Framework", "SeleniumLibrary", "Python", "Chrome"]),
      metrics: JSON.stringify([
        "Automates the full account registration flow",
        "Checks that the resulting URL contains /success",
      ]),
      githubUrl: "https://github.com/AyoubBoumalek/Subscribe-Form",
      demoUrl: "https://tutorialsninja.com/demo",
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
