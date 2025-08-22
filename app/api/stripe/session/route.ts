import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" } as any);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["customer"] });
    const email =
      (session.customer_details && session.customer_details.email) ||
      (typeof session.customer !== "string" && session.customer?.email) ||
      null;

    return NextResponse.json({ email, status: session.status, subscription: session.subscription });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Stripe error" }, { status: 500 });
  }
}
