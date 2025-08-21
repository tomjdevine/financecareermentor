import { NextResponse } from "next/server";
import Stripe from "stripe";
import { currentUser } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" } as any);

export async function GET() {
  try {
    const user = await currentUser();
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json({ active: false, reason: "not_signed_in" });
    }
    const email = user.emailAddresses[0].emailAddress;

    // Find customers with this email
    const customers = await stripe.customers.list({ email, limit: 5 });
    let active = false;

    for (const cust of customers.data) {
      const subs = await stripe.subscriptions.list({ customer: cust.id, status: "active", limit: 1 });
      if (subs.data.length > 0) { active = true; break; }
    }

    return NextResponse.json({ active });
  } catch (e: any) {
    return NextResponse.json({ active: false, error: e.message }, { status: 500 });
  }
}
