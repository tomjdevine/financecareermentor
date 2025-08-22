import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" } as any);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["customer"] });

    // Safely derive the purchaser email:
    // 1) Prefer session.customer_details.email
    // 2) Fallback to expanded customer.email when it's a non-deleted Customer object
    let email: string | null = null;
    if (session.customer_details?.email) {
      email = session.customer_details.email;
    } else if (session.customer && typeof session.customer !== "string") {
      const cust = session.customer as Stripe.Customer | Stripe.DeletedCustomer;
      if ("deleted" in cust && cust.deleted) {
        email = null;
      } else if ("email" in cust) {
        email = (cust as Stripe.Customer).email ?? null;
      }
    }

    return NextResponse.json({ email, status: session.status, subscription: session.subscription });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Stripe error" }, { status: 500 });
  }
}
