import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "../../../../lib/db";
import Stripe from "stripe";

export const runtime = "nodejs";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";

const stripe = new Stripe(STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" } as any);

export async function POST() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: user, error } = await supabaseAdmin
    .from("app_users")
    .select("stripe_customer_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (error || !user?.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: APP_URL || "/",
  });

  return NextResponse.json({ url: session.url });
}
