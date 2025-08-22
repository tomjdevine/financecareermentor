import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "../../../../lib/db";

export const runtime = "nodejs";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const PRICE_ID = process.env.STRIPE_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";

const stripe = new Stripe(STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" } as any);

export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
  }
  if (!PRICE_ID) {
    return NextResponse.json({ error: "Missing STRIPE_PRICE_ID or NEXT_PUBLIC_STRIPE_PRICE_ID" }, { status: 500 });
  }
  if (!APP_URL || !APP_URL.startsWith("http")) {
    return NextResponse.json({ error: "Missing or invalid NEXT_PUBLIC_APP_URL" }, { status: 500 });
  }

  try {
    const user = await currentUser();
    const email =
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      undefined;

    // Ensure an app_users row exists; fetch known customer id if any
    const { data: existingUser, error: userFetchErr } = await supabaseAdmin
      .from("app_users")
      .select("clerk_user_id, stripe_customer_id")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (userFetchErr) {
      throw new Error(`DB read failed: ${userFetchErr.message}`);
    }

    let stripeCustomerId = existingUser?.stripe_customer_id || null;

    if (!existingUser) {
      const { error: insErr } = await supabaseAdmin
        .from("app_users")
        .insert({ clerk_user_id: userId, email });
      if (insErr) throw new Error(`DB insert failed: ${insErr.message}`);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      allow_promotion_codes: true,
      customer: stripeCustomerId || undefined,
      customer_email: stripeCustomerId ? undefined : email,
      client_reference_id: userId,
      subscription_data: {
        metadata: { clerkUserId: userId },
      },
      automatic_tax: { enabled: true },
      success_url: `${APP_URL}/chat?subscribed=1`,
      cancel_url: `${APP_URL}/subscribe?canceled=1`,
    });

    if (!session?.url) {
      return NextResponse.json({ error: "Stripe did not return a session URL." }, { status: 500 });
    }
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Stripe error" }, { status: 500 });
  }
}
