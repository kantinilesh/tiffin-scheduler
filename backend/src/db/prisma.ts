/**
 * prisma.ts — Singleton Prisma client instance.
 * Re-uses a single connection across the app to avoid exhausting
 * the database connection pool during development (where ts-node-dev
 * restarts the process frequently).
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
