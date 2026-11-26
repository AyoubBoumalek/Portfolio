import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const migrationName = "20261126000000_init";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to prepare the database migration.");
}

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

try {
  const [migrationTable] = await prisma.$queryRaw`
    SELECT to_regclass('public._prisma_migrations')::text AS name
  `;

  if (migrationTable?.name) {
    const failed = await prisma.$queryRaw`
      SELECT 1
      FROM "_prisma_migrations"
      WHERE migration_name = ${migrationName}
        AND finished_at IS NULL
        AND rolled_back_at IS NULL
      LIMIT 1
    `;

    if (failed.length > 0) {
      const npx = process.platform === "win32" ? "npx.cmd" : "npx";
      execFileSync(npx, ["prisma", "migrate", "resolve", "--rolled-back", migrationName], {
        stdio: "inherit",
      });
    }
  }
} finally {
  await prisma.$disconnect();
}
