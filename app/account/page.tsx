"use client";

import { SignedIn, SignedOut, SignInButton, UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Your Account</h1>

      <SignedOut>
        <div className="card p-6">
          <p className="mb-4">Please sign in to manage your account.</p>
          <SignInButton mode="modal">
            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
              Sign in
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-4 lg:p-6 order-2 lg:order-1">
            {/* Render inline, not as a full-page overlay */}
            <UserProfile routing="hash" />
          </div>

          <div className="card p-4 lg:p-6 order-1 lg:order-2">
            <h2 className="text-lg font-medium mb-2">Subscription</h2>
            <p className="text-slate-600 mb-4">
              Update payment method, download invoices, or cancel anytime via Stripe’s secure billing portal.
            </p>
            <a
              href="/api/stripe/portal"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Manage subscription
            </a>
            <p className="text-xs text-slate-500 mt-3">
              You’ll be redirected to the Stripe Billing Portal.
            </p>
          </div>
        </div>
      </SignedIn>
    </main>
  );
}
