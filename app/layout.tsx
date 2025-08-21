import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

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
        <body className={inter.className}>
          <nav className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-slate-200">
            <div className="container flex items-center justify-between h-14">
              <div className="flex items-center gap-4">
                <Link href="/" className="font-semibold tracking-tight text-slate-900">Finance Career Mentor</Link>
                <Link href="/chat" className="text-sm text-slate-600 hover:text-slate-900">Chat</Link>
                <Link href="/subscribe" className="text-sm text-slate-600 hover:text-slate-900">Subscribe</Link>
              </div>
              <div className="flex items-center gap-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition">
                      Sign in
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton appearance={{ elements: { userButtonTrigger: "rounded-full border border-slate-200" } }} />
                </SignedIn>
              </div>
            </div>
          </nav>
          {children}
          <footer className="py-10 text-center text-sm text-slate-600">
            <div className="container">
              <p>© {new Date().getFullYear()} Finance Career Mentor. First question free — sign in & subscribe for unlimited conversations.</p>
              <p className="mt-2">Not legal, financial, or HR advice. Avoid sharing confidential or proprietary information.</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
