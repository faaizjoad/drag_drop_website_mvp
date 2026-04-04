import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BLANK_PUCK_DATA = { content: [], root: { props: {} }, zones: {} };

async function main() {
  // Demo user
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      passwordHash,
    },
  });

  console.log(`Demo user: ${user.email}`);

  // Demo site
  const site = await prisma.site.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Site",
      slug: "demo",
      userId: user.id,
    },
  });

  console.log(`Demo site: ${site.slug}`);

  // Demo pages
  const pages = [
    { title: "Home", path: "/" },
    { title: "About", path: "/about" },
    { title: "Contact", path: "/contact" },
  ];

  for (const { title, path } of pages) {
    const page = await prisma.page.upsert({
      where: { siteId_path: { siteId: site.id, path } },
      update: {},
      create: {
        title,
        path,
        siteId: site.id,
        puckData: BLANK_PUCK_DATA,
        isPublished: false,
      },
    });
    console.log(`  Page: ${page.title} (${page.path})`);
  }

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
