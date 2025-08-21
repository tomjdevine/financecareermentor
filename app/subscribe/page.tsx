"use client";

import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useState } from "react";

export default function SubscribePage() {
  const { user } = useUser();
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
        <h1 className="text-2xl font-bold text-slate-900">Pro Plan</h1>
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
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium w-full hover:bg-blue-700 transition">
                Sign in to subscribe
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <button
              onClick={beginCheckout}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium w-full disabled:opacity-60 hover:bg-blue-700 transition"
            >
              {loading ? "Redirecting to checkout..." : "Subscribe monthly"}
            </button>
          </SignedIn>
        </div>
        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      </div>
    </main>
  );
}
