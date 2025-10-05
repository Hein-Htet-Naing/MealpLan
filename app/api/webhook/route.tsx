import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyStripeEvent } from "@/lib/verifyStripeEvent";
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
        handleSessionCompleted(session);
        break;
      }
      case "invoice.payment_failed": {
        const session = event.data.object as Stripe.Invoice;
        handleInvoicePaymentFailed(session);
        break;
      }
      case "customer.subscription.deleted": {
        const session = event.data.object as Stripe.Subscription;
        handleSubscriptionDeleted(session);
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
//handlers
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
    await prisma?.profile.update({
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
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {}
async function handleSubscriptionDeleted(session: Stripe.Subscription) {}
