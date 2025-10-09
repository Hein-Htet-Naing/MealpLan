import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyStripeEvent } from "@/lib/verifyStripeEvent";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    // Verify the event by constructing it with the raw body and signature
    event = verifyStripeEvent(Buffer.from(body), signature!);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session);
        handleSessionCompleted(session);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        handleInvoicePaymentFailed(invoice);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        handleSubscriptionDeleted(subscription);
        break;
      }
      default: {
        console.warn(`Unhandled event type: ${event.type}`);
      }
    }
  } catch (error: any) {
    console.error("Error handling webhook event:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
//handlers for session completed
async function handleSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.clerkUserId;
  if (!userId) {
    return NextResponse.json({ message: "User ID not found" }, { status: 400 });
  }
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    return NextResponse.json(
      { message: "Subscription ID not found" },
      { status: 400 }
    );
  }
  const planType = session.metadata?.planType;
  try {
    await prisma.profile.update({
      where: { userId },
      data: {
        subscriptionActive: true,
        stripeSubscriptionId: subscriptionId,
        subscriptionTier: planType || null,
      },
    });
  } catch (error: any) {
    console.log(error.message);
  }
}

//handlers for invoice payment failed
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId =
    "subscription" in invoice && invoice.subscription
      ? (invoice.subscription as string)
      : "";

  let userID: string | undefined;
  //find the user profile that match with subId, later to fetch userid
  try {
    const profile = await prisma.profile.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      select: { userId: true },
    });

    if (!profile) {
      console.error("No profile found for this subscription ID.");
      return;
    }
    userID = profile.userId;
  } catch (error: any) {
    console.error("Prisma Query Error:", error.message);
    return;
  }

  try {
    await prisma.profile.update({
      where: { userId: userID },
      data: {
        subscriptionActive: false,
      },
    });
  } catch (error: any) {
    console.error("Prisma Update Error:", error.message);
  }
}
//handlers for Subscription deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId =
    "subscription" in subscription && subscription.subscription
      ? (subscription.subscription as string)
      : "";

  let userID: string | undefined;
  //find the user profile that match with subId, later to fetch userid
  try {
    const profile = await prisma.profile.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      select: { userId: true },
    });

    if (!profile) {
      console.error("No profile found for this subscription ID.");
      return;
    }
    userID = profile.userId;
  } catch (error: any) {
    console.error("Prisma Query Error:", error.message);
    return;
  }

  try {
    await prisma.profile.update({
      where: { userId: userID },
      data: {
        subscriptionTier: null,
        subscriptionActive: false,
        stripeSubscriptionId: null,
      },
    });
  } catch (error: any) {
    console.error("Prisma Update Error:", error.message);
  }
}
