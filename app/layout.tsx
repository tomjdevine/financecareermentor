import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://financecareermentor.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Finance Career Mentor — Specific, senior-level advice on demand",
  description: "Chat with an AI mentor tuned for finance careers. Resume reviews, offer decisions, raise planning, interview prep — first question free.",
  openGraph: {
    title: "Finance Career Mentor — Specific, senior-level advice on demand",
    description: "Chat with an AI mentor tuned for finance careers. Resume reviews, offer decisions, raise planning, interview prep — first question free.",
    url: "/",
    siteName: "Finance Career Mentor",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finance Career Mentor — Specific, senior-level advice on demand",
    description: "Chat with an AI mentor tuned for finance careers. Resume reviews, offer decisions, raise planning, interview prep — first question free.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <nav className="sticky top-0 z-30 backdrop-blur bg-black/20 border-b border-white/10">
            <div className="container flex items-center justify-between h-14">
              <div className="flex items-center gap-4">
                <Link href="/" className="font-semibold tracking-tight">Finance Career Mentor</Link>
                <Link href="/chat" className="text-sm text-gray-300 hover:text-white">Chat</Link>
                <Link href="/subscribe" className="text-sm text-gray-300 hover:text-white">Subscribe</Link>
              </div>
              <div className="flex items-center gap-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 hover:bg-white/20 text-sm">
                      Sign in
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton appearance={{ elements: { userButtonTrigger: "outline outline-1 outline-white/20 rounded-full" } }} />
                </SignedIn>
              </div>
            </div>
          </nav>
          {children}
          <footer className="py-10 text-center text-sm text-gray-400">
            <div className="container">
              <p>© {new Date().getFullYear()} Finance Career Mentor. First question free — sign in & subscribe for unlimited conversations.</p>
              <p className="mt-2 opacity-80">Not legal, financial, or HR advice. Avoid sharing confidential or proprietary information.</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
