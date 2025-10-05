import { stripe, webhookSecret } from "@/lib/stripe";
import Stripe from "stripe";
export function verifyStripeEvent(
  body: Buffer,
  signature: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (error: any) {
    console.error("Webhook verification failed:", error.message);
    throw new Error(`Webhook Error: ${error.message}`);
  }
}
