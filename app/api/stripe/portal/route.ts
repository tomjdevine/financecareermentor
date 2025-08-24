import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

function getAppBaseUrl(req: NextRequest) {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const origin = req.headers.get("origin") || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  return String(origin).replace(/\/$/, "");
}

async function resolveStripeCustomerId(userId: string, email: string | null) {
  try {
    const byMeta = await stripe.customers.search({
      query: `metadata['clerkUserId']:'${userId}'`,
      limit: 1,
    });
    if (byMeta.data[0]?.id) return byMeta.data[0].id;
  } catch {}

  if (email) {
    try {
      const byEmail = await stripe.customers.search({
        query: `email:'${email}'`,
        limit: 1,
      });
      if (byEmail.data[0]?.id) return byEmail.data[0].id;
    } catch {}
  }

  const created = await stripe.customers.create({
    email: email || undefined,
    metadata: { clerkUserId: userId },
  });
  return created.id;
}

async function createPortalUrl(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url), 302);
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    null;

  const customerId = await resolveStripeCustomerId(userId, email);

  const returnBase = getAppBaseUrl(req);
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${returnBase}/chat`,
  });
  return portal.url;
}

export async function GET(req: NextRequest) {
  try {
    const url = await createPortalUrl(req);
    if (typeof url !== "string") return url as any;
    return NextResponse.redirect(url, 302);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to create billing portal session" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const url = await createPortalUrl(req);
    if (typeof url !== "string") return url as any;
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to create billing portal session" }, { status: 500 });
  }
}
