import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth, currentUser } from "@clerk/nextjs/server";

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

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_creation: "always",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      allow_promotion_codes: true,
      customer_email: email,
      client_reference_id: userId,
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
