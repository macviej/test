import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  __prisma?: PrismaClient;
  __schemaReady?: Promise<void>;
};

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}

export async function ensureAppSchema() {
  if (!globalForPrisma.__schemaReady) {
    globalForPrisma.__schemaReady = (async () => {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "Participant" ADD COLUMN IF NOT EXISTS "lunchType" TEXT`,
      );
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "Participant" ADD COLUMN IF NOT EXISTS "hasAllergy" BOOLEAN`,
      );
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "Participant" ADD COLUMN IF NOT EXISTS "allergyNote" TEXT NOT NULL DEFAULT ''`,
      );
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ProjectorState" (
          "id" TEXT NOT NULL DEFAULT 'default',
          "mode" TEXT NOT NULL DEFAULT 'list',
          "questionId" TEXT,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ProjectorState_pkey" PRIMARY KEY ("id")
        )
      `);
    })().catch((error) => {
      globalForPrisma.__schemaReady = undefined;
      throw error;
    });
  }
  await globalForPrisma.__schemaReady;
}
