import { currentUser } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getPriceID } from "@/lib/plan";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    const userID = user?.id;
    if (!userID) {
      return NextResponse.json({ error: "No User Founded" }, { status: 401 });
    }

    const { newPlan } = await request.json();
    const findPlanType = newPlan.toLowerCase().includes("week")
      ? "week"
      : newPlan.toLowerCase().includes("month")
      ? "month"
      : "year";

    //fetch sudId of current user from profile table
    const profile = await prisma?.profile.findUnique({
      where: { userId: userID },
    });
    if (!profile?.stripeSubscriptionId) {
      throw new Error("No active subscription found.");
    }
    const subscriptionId = profile?.stripeSubscriptionId;

    const subscription = await stripe?.subscriptions.retrieve(subscriptionId);
    const subItemId = subscription.items.data[0]?.id;

    if (!subItemId) {
      throw new Error("Subscription item not found.");
    }
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: false,
        items: [
          {
            id: subItemId,
            price: getPriceID(findPlanType),
          },
        ],
      }
    );

    await prisma.profile.update({
      where: { userId: userID },
      data: {
        subscriptionTier: findPlanType,
        stripeSubscriptionId: updatedSubscription.id,
        subscriptionActive: true,
      },
    });
    return NextResponse.json({ subscriptions: updatedSubscription });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to change subscription plan." },
      { status: 500 }
    );
  }
}
