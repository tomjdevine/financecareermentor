"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SignUp } from "@clerk/nextjs";

export default function WelcomePage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session_id = searchParams.get("session_id");
    if (!session_id) {
      setError("Missing session_id");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/stripe/session?session_id=${encodeURIComponent(session_id)}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setEmail(data.email || null);
      } catch (e: any) {
        setError(e.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  return (
    <main className="container py-12">
      <div className="max-w-xl mx-auto card p-8">
        <h1 className="text-2xl font-bold text-slate-900">You're in — finish creating your account</h1>
        <p className="text-slate-600 mt-2">
          Thanks for subscribing! Create your account to start chatting. Please use the{" "}
          <strong>same email</strong> you used at checkout{email ? ` (${email})` : ""}.
        </p>

        {loading && <p className="text-slate-600 mt-4">Loading…</p>}
        {error && <p className="text-red-600 mt-4">{error}</p>}

        <div className="mt-6">
          <SignUp signInUrl="/sign-in" afterSignUpUrl="/chat?subscribed=1" />
        </div>
      </div>
    </main>
  );
}
