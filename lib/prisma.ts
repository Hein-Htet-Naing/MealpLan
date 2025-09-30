// import { PrismaClient } from "@prisma/client";

// declare global {
// Allow global `var` declarations
// to prevent multiple Prisma Client instances in dev
// See https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
// eslint-disable-next-line no-var
//   var prisma: PrismaClient | undefined;
// }

// let prisma: PrismaClient;

// if (process.env.NODE_ENV === "production") {
//   prisma = new PrismaClient();
// } else {
//   if (!global.prisma) {
//     global.prisma = new PrismaClient();
//   }
//   prisma = global.prisma;
// }

// export { prisma };
// filepath: d:\nextjs\SaaS Website\saas_web\lib\prisma.ts
import { PrismaClient } from "../app/generated/prisma";
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
