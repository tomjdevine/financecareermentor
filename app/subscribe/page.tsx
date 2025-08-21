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
        <h1 className="text-2xl font-bold">Pro Plan</h1>
        <p className="text-gray-300 mt-2">
          Unlimited chat conversations with your finance mentor. Cancel anytime.
        </p>
        <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-sm text-gray-300">What you get:</p>
          <ul className="list-disc list-inside text-gray-200 mt-2 space-y-1">
            <li>Unlimited questions & follow-ups</li>
            <li>Resume/CV reviews with targeted wording</li>
            <li>Offer evaluations & negotiation prep</li>
            <li>Interview drills and story refinement</li>
          </ul>
        </div>

        <div className="mt-6">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-xl bg-white text-black font-medium w-full">
                Sign in to subscribe
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <button
              onClick={beginCheckout}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white text-black font-medium w-full disabled:opacity-60"
            >
              {loading ? "Redirecting to checkout..." : "Subscribe monthly"}
            </button>
          </SignedIn>
        </div>
        {error && <p className="text-red-300 text-sm mt-3">{error}</p>}
      </div>
    </main>
  );
}
