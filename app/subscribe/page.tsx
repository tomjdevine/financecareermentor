"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useState } from "react";

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const beginCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create checkout session");
      const data = await res.json();
      if (data.url) window.location.href = data.url as string;
      else throw new Error("No checkout URL received");
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-12">
      <div className="max-w-xl mx-auto card p-8">
        <h1 className="text-2xl font-bold text-slate-900">Unlimited Plan - $9 per month</h1>
        <p className="text-slate-600 mt-2">
          Unlimited chat conversations with your finance mentor. Cancel anytime.
        </p>
        <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-sm text-slate-600">What you get:</p>
          <ul className="list-disc list-inside text-slate-700 mt-2 space-y-1">
            <li>Unlimited questions & follow-ups</li>
            <li>Resume/CV reviews with targeted wording</li>
            <li>Offer evaluations & negotiation prep</li>
            <li>Interview drills and story refinement</li>
          </ul>
        </div>

        <div className="mt-6">
          {/* Signed-out users go straight to Stripe Checkout (account created after payment on /welcome) */}
          <SignedOut>
            <div className="grid gap-2">
              <button
                onClick={beginCheckout}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium w-full disabled:opacity-60 hover:bg-blue-700 transition"
              >
                {loading ? "Redirecting..." : "Get Started"}
              </button>
              <div className="text-center text-sm text-slate-600">
                Already a member?{" "}
                <SignInButton mode="modal">
                  <button className="underline underline-offset-2 hover:text-slate-900">Sign in</button>
                </SignInButton>
              </div>
            </div>
          </SignedOut>

          {/* Signed-in users can also subscribe directly */}
          <SignedIn>
            <button
              onClick={beginCheckout}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium w-full disabled:opacity-60 hover:bg-blue-700 transition"
            >
              {loading ? "Redirecting..." : "Subscribe monthly"}
            </button>
          </SignedIn>
        </div>
        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      </div>
    </main>
  );
}
