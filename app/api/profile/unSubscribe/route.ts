import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
export async function POST() {
  try {
    const user = await currentUser();
    const userID = user?.id;
    if (!userID) {
      return NextResponse.json({ error: "User is not found!" });
    }
    const profile = await prisma.profile.findUnique({
      where: { userId: userID },
    });
    if (!profile?.stripeSubscriptionId) {
      throw new Error("No active subscription found.");
    }
    const subscirbeId = profile?.stripeSubscriptionId;

    const updateSubscription = await stripe.subscriptions.update(subscirbeId, {
      cancel_at_period_end: true,
    });

    await prisma.profile.update({
      where: { userId: userID },
      data: {
        subscriptionTier: null,
        stripeSubscriptionId: null,
        subscriptionActive: false,
      },
    });
    return NextResponse.json({ subscription: updateSubscription });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch subscription details." + error.message },
      { status: 500 }
    );
  }
}
