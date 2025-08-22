import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../../lib/db";

export const runtime = "nodejs";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

const stripe = new Stripe(STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" } as any);

async function upsertUser({
  clerkUserId,
  email,
  stripeCustomerId,
}: {
  clerkUserId: string | null | undefined;
  email: string | null | undefined;
  stripeCustomerId: string;
}) {
  if (!clerkUserId && !email) return;
  if (clerkUserId) {
    const { data: existing } = await supabaseAdmin
      .from("app_users")
      .select("clerk_user_id, stripe_customer_id")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();

    if (existing) {
      if (!existing.stripe_customer_id) {
        await supabaseAdmin
          .from("app_users")
          .update({ stripe_customer_id: stripeCustomerId, email })
          .eq("clerk_user_id", clerkUserId);
      }
    } else {
      await supabaseAdmin
        .from("app_users")
        .insert({ clerk_user_id: clerkUserId, email, stripe_customer_id: stripeCustomerId });
    }
  } else if (email) {
    const { data: existingByEmail } = await supabaseAdmin
      .from("app_users")
      .select("clerk_user_id, stripe_customer_id")
      .eq("email", email)
      .maybeSingle();

    if (existingByEmail) {
      if (!existingByEmail.stripe_customer_id) {
        await supabaseAdmin
          .from("app_users")
          .update({ stripe_customer_id: stripeCustomerId })
          .eq("email", email);
      }
    } else {
      await supabaseAdmin
        .from("app_users")
        .insert({ clerk_user_id: null, email, stripe_customer_id: stripeCustomerId });
    }
  }
}

async function upsertSubscription(sub: Stripe.Subscription, clerkUserIdFromMeta?: string | null) {
  const stripeSubscriptionId = sub.id;
  const stripeCustomerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const price = sub.items.data[0]?.price?.id || "unknown";
  const status = sub.status;
  const currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
  const clerkUserId =
    clerkUserIdFromMeta ||
    (typeof sub.metadata?.clerkUserId === "string" ? sub.metadata.clerkUserId : null);

  let resolvedClerkId = clerkUserId;
  if (!resolvedClerkId) {
    const { data: userByCustomer } = await supabaseAdmin
      .from("app_users")
      .select("clerk_user_id")
      .eq("stripe_customer_id", stripeCustomerId)
      .maybeSingle();
    resolvedClerkId = userByCustomer?.clerk_user_id || null;
  }

  const payload: any = {
    clerk_user_id: resolvedClerkId,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_customer_id: stripeCustomerId,
    price_id: price,
    status,
    current_period_end: currentPeriodEnd,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("id, clerk_user_id")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from("subscriptions")
      .update(payload)
      .eq("id", existing.id);
  } else {
    await supabaseAdmin
      .from("subscriptions")
      .insert(payload);
  }
}

export async function POST(req: NextRequest) {
  if (!STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }
  let event: Stripe.Event;

  const sig = req.headers.get("stripe-signature") as string;
  const raw = await req.text();

  try {
    event = stripe.webhooks.constructEvent(raw, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const stripeCustomerId = (session.customer as string) || "";
        const clerkUserId = (session.client_reference_id as string) || (session.metadata?.clerkUserId as string) || null;
        const email = session.customer_details?.email || null;

        await upsertUser({ clerkUserId, email, stripeCustomerId });

        if (session.subscription) {
          const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await upsertSubscription(sub, clerkUserId);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscription(sub);
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Webhook handling error" }, { status: 500 });
  }
}
