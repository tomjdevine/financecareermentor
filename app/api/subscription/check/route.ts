import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "../../../../lib/db";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ active: false, reason: "not_authenticated" });

  const { data, error } = await supabaseAdmin
    .from("current_subscriptions")
    .select("status")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ active: false, reason: "db_error", detail: error.message });
  }

  const active = data ? ["active", "trialing"].includes((data as any).status) : false;
  return NextResponse.json({ active });
}
