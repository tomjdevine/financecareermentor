import { NextResponse } from "next/server";
import Stripe from "stripe";

// Ensure Node runtime (Stripe SDK requires Node, not Edge)
export const runtime = "nodejs";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const PRICE_ID = process.env.STRIPE_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";

const stripe = new Stripe(STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" } as any);

export async function POST() {
  // Validate env upfront and return actionable messages (no secrets exposed)
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY in environment variables." },
      { status: 500 },
    );
  }
  if (!PRICE_ID) {
    return NextResponse.json(
      { error: "Missing STRIPE_PRICE_ID (or NEXT_PUBLIC_STRIPE_PRICE_ID) in environment variables." },
      { status: 500 },
    );
  }
  if (!APP_URL || !APP_URL.startsWith("http")) {
    return NextResponse.json(
      { error: "Missing or invalid NEXT_PUBLIC_APP_URL (e.g. https://financecareermentor.com)." },
      { status: 500 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_creation: "always",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${APP_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/subscribe?canceled=1`,
    });

    if (!session?.url) {
      return NextResponse.json({ error: "Stripe did not return a session URL." }, { status: 500 });
    }
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    // Surface the Stripe error message so you can see exactly what's wrong (e.g., "No such price")
    const message = e?.message || "Stripe error creating checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
