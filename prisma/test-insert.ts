import { PrismaClient } from "../app/generated/prisma";
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.profile.create({
    data: {
      userId: "test-user-id",
      email: "test@example.com",
      subscriptionActive: false,
      subscriptionTier: null,
      stripeSubscriptionId: null,
    },
  });
  console.log(profile);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
