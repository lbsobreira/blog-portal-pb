import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Create default site settings
  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "My Blog",
      siteTagline: "A personal space to showcase projects and share knowledge",
      profileBio: "Welcome to my blog! I share my journey in tech, tutorials, and project showcases.",
    },
  });
  console.log("Created site settings:", settings.siteName);

  // Create sample categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "tutorials" },
      update: {},
      create: {
        name: "Tutorials",
        slug: "tutorials",
        description: "Step-by-step guides and how-to articles",
      },
    }),
    prisma.category.upsert({
      where: { slug: "projects" },
      update: {},
      create: {
        name: "Projects",
        slug: "projects",
        description: "Project showcases and case studies",
      },
    }),
    prisma.category.upsert({
      where: { slug: "thoughts" },
      update: {},
      create: {
        name: "Thoughts",
        slug: "thoughts",
        description: "Personal reflections and industry insights",
      },
    }),
  ]);
  console.log(`Created ${categories.length} categories`);

  // Create sample tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: "javascript" },
      update: {},
      create: { name: "JavaScript", slug: "javascript" },
    }),
    prisma.tag.upsert({
      where: { slug: "typescript" },
      update: {},
      create: { name: "TypeScript", slug: "typescript" },
    }),
    prisma.tag.upsert({
      where: { slug: "react" },
      update: {},
      create: { name: "React", slug: "react" },
    }),
    prisma.tag.upsert({
      where: { slug: "nextjs" },
      update: {},
      create: { name: "Next.js", slug: "nextjs" },
    }),
    prisma.tag.upsert({
      where: { slug: "nodejs" },
      update: {},
      create: { name: "Node.js", slug: "nodejs" },
    }),
    prisma.tag.upsert({
      where: { slug: "database" },
      update: {},
      create: { name: "Database", slug: "database" },
    }),
    prisma.tag.upsert({
      where: { slug: "devops" },
      update: {},
      create: { name: "DevOps", slug: "devops" },
    }),
    prisma.tag.upsert({
      where: { slug: "web-development" },
      update: {},
      create: { name: "Web Development", slug: "web-development" },
    }),
  ]);
  console.log(`Created ${tags.length} tags`);

  console.log("\nSeed completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Sign in with your email to create your user account");
  console.log("2. Promote yourself to admin:");
  console.log('   UPDATE "User" SET role = \'ADMIN\' WHERE email = \'your@email.com\';');
  console.log("3. Go to Admin > Settings to customize your site");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
