"use client";

import { SignInButton } from "@clerk/nextjs";

export default function SignInCta() {
  const handleClick = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "sign_in_click", { location: "navbar" });
    }
  };
  return (
    <SignInButton mode="modal">
      <button
        onClick={handleClick}
        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
      >
        Sign in
      </button>
    </SignInButton>
  );
}
