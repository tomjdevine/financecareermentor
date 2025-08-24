import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Finance Career Mentor",
  description:
    "Chat with a seasoned finance mentor—anytime. Get actionable guidance from an AI mentor trained on 50,000 finance-career insights curated from industry-leading executives.",
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-RCX9Y9PNK9";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Google Analytics */}
          {GA_ID ? (
            <>
              <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_ID}', { anonymize_ip: true });
                  `,
                }}
              />
            </>
          ) : null}
        </head>
        <body>
          <header className="border-b bg-white">
            <div className="mx-auto w-full max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
              <Link href="/" className="font-semibold text-slate-900">
                FinanceCareerMentor
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link href="/subscribe" className="text-slate-700 hover:text-slate-900">
                  Pricing
                </Link>
                <Link href="/account" className="text-slate-700 hover:text-slate-900">
                  Account
                </Link>
                <Link href="/contact" className="text-slate-700 hover:text-slate-900">
                  Contact
                </Link>
                <Link href="/chat" className="text-slate-700 hover:text-slate-900">
                  Chat
                </Link>
              </nav>

              <div className="flex items-center gap-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                      Sign in
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton
                    appearance={{
                      elements: { avatarBox: "w-8 h-8" },
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </header>

          <main>{children}</main>

          <footer className="border-t mt-12">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-slate-500">
              Not legal or financial advice. Avoid sharing confidential or proprietary information.
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}