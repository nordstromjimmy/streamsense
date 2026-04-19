import { db } from "@/app/lib/db";
import { stripe } from "@/app/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("[Stripe webhook] Invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        await db.user.update({
          where: { id: userId },
          data: {
            isPro: true,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });
        console.log(`[Stripe] User ${userId} upgraded to Pro`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await db.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });
        if (!user) break;

        await db.user.update({
          where: { id: user.id },
          data: { isPro: false, stripeSubscriptionId: null },
        });
        console.log(`[Stripe] User ${user.id} downgraded from Pro`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await db.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });
        if (!user) break;

        // Handle cases like failed payment putting sub on hold
        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";
        await db.user.update({
          where: { id: user.id },
          data: { isPro: isActive },
        });
        console.log(
          `[Stripe] User ${user.id} subscription status: ${subscription.status}`,
        );
        break;
      }
    }
  } catch (err) {
    console.error("[Stripe webhook] Handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
