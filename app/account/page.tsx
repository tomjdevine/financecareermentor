"use client";

import { SignedIn, SignedOut, SignInButton, useClerk } from "@clerk/nextjs";

export default function AccountPage() {
  const { openUserProfile } = useClerk();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Your Account</h1>

      <SignedOut>
        <div className="card p-6">
          <p className="mb-4">Please sign in to manage your account and subscription.</p>
          <SignInButton mode="modal">
            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
              Sign in
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manage subscription (Stripe Billing Portal) */}
          <section className="card p-6">
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
            <p className="text-xs text-slate-500 mt-3">You’ll be redirected to the Stripe Billing Portal.</p>
          </section>

          {/* Manage account (opens Clerk modal) */}
          <section className="card p-6">
            <h2 className="text-lg font-medium mb-2">Account</h2>
            <p className="text-slate-600 mb-4">
              Update your profile, email, or password using the Clerk account modal.
            </p>
            <button
              onClick={() => openUserProfile()}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            >
              Manage account
            </button>
            <p className="text-xs text-slate-500 mt-3">Opens the Clerk account modal.</p>
          </section>
        </div>
      </SignedIn>
    </main>
  );
}
