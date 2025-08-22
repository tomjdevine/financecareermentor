import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" } as any);

export async function POST() {
  try {
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!priceId || !appUrl) return NextResponse.json({ error: "Missing Stripe env vars" }, { status: 500 });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_creation: "always",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${appUrl}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/subscribe?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Stripe error" }, { status: 500 });
  }
}
